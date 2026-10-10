import * as SecureStore from 'expo-secure-store';

// Assuming local testing for now. Use an IP address for testing on physical devices, or localhost for emulators.
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000'; // 10.0.2.2 is Android emulator's localhost

// @TODO (Backend Developer): The Next.js backend has no REST login route yet (it uses the
// `loginAction` Server Action + an HTTP-only cookie). When `app/api/auth/login/route.ts` is
// added, set EXPO_PUBLIC_AUTH_LOGIN_PATH=/api/auth/login. Expected contract (matches the
// backend's `ServiceResult<T>` / `AuthUser` types):
//   200 -> { success: true,  message: string, data: { user: AuthUser, token: string } }
//   401 -> { success: false, message: "Invalid email or password." }
// The token must be the JWT from `lib/auth/jwt.ts#createToken`, returned in the body because
// native clients send it as `Authorization: Bearer <token>` rather than relying on cookies.
export const AUTH_LOGIN_PATH = process.env.EXPO_PUBLIC_AUTH_LOGIN_PATH || '/login';

const AUTH_TOKEN_KEY = 'authToken';
const DEFAULT_TIMEOUT_MS = 15000;

// Token is only readable while the device is unlocked and is never migrated to backups/other devices.
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * Error thrown for any failed API call.
 * `status` is the HTTP status, or 0 for network failures / timeouts.
 */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Mirrors the backend's `AuthUser` type (types/auth.ts). Never contains a password. */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
}

export interface LoginResult {
  user: User;
  token: string;
}

/** Picks only safe fields so a password hash (or anything else) is never kept in memory/params. */
function toSafeUser(raw: any): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = Number(raw.id);
  const roleId = Number(raw.roleId);
  if (!Number.isInteger(id) || id <= 0 || typeof raw.email !== 'string') return null;
  return {
    id,
    roleId: Number.isInteger(roleId) ? roleId : 0,
    email: raw.email,
    firstName: typeof raw.firstName === 'string' ? raw.firstName : '',
    lastName: typeof raw.lastName === 'string' ? raw.lastName : '',
  };
}

/**
 * Accepts both the backend `ServiceResult` shape and the legacy mock shape:
 *   { success, message, data: { user, token } }
 *   { success, message, data: AuthUser, token }
 *   { user, token }   (legacy mock-server)
 */
function normalizeLoginResponse(raw: any): LoginResult {
  if (raw?.success === false) {
    throw new ApiError(401, raw?.message || 'Invalid email or password.');
  }
  const payload = raw?.data ?? raw;
  const token = payload?.token ?? raw?.token;
  const user = toSafeUser(payload?.user ?? (payload?.id !== undefined ? payload : null));

  if (typeof token !== 'string' || token.length === 0 || !user) {
    throw new ApiError(500, 'Unexpected response from server.');
  }
  return { user, token };
}

export interface ResearchPaper {
  id: number;
  groupId: number;
  title: string;
  abstract: string;
  category?: string;
  keywords?: string;
  status: string;
}

export interface ResearchGroup {
  id: number;
  groupName: string;
  strand: string;
  section: string;
  schoolYear: string;
  adviserId: number;
  status: string;
}

export function isApiError(error: unknown): error is ApiError {
  return !!error && typeof (error as any).status === 'number' && (error as any).name === 'ApiError';
}

type RequestOptions = RequestInit & {
  /** Attach the stored bearer token (default true). */
  auth?: boolean;
  timeoutMs?: number;
};

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  }

  private async setAuthToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, SECURE_STORE_OPTIONS);
  }

  private async makeRequest(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const { auth = true, timeoutMs = DEFAULT_TIMEOUT_MS, ...init } = options;
    const token = auth ? await this.getAuthToken() : null;
    
    // Add auth headers if token exists
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...((init.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...init,
        headers,
        signal: controller.signal,
      });
    } catch {
      // Network failure or timeout — never echo low-level details to the UI.
      throw new ApiError(0, 'Unable to reach the server. Check your connection and try again.');
    } finally {
      clearTimeout(timer);
    }

    // Handle non-JSON responses gracefully (don't leak raw HTML/stack traces into the UI)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new ApiError(response.status, `Unexpected response from server (HTTP ${response.status}).`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new ApiError(response.status, 'Unexpected response from server.');
    }

    if (!response.ok) {
      throw new ApiError(response.status, data?.message || `HTTP ${response.status}`);
    }

    return data;
  }

  // --- Auth ---
  async login(email: string, password: string): Promise<LoginResult> {
    // Refuse to send credentials over plaintext HTTP in release builds.
    if (!__DEV__ && !BASE_URL.startsWith('https://')) {
      throw new ApiError(0, 'A secure connection is required to sign in.');
    }

    // Drop any stale session before authenticating a new one.
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);

    const raw = await this.makeRequest(AUTH_LOGIN_PATH, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    });

    const result = normalizeLoginResponse(raw);
    await this.setAuthToken(result.token);
    return result;
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  }

  // --- Papers ---
  async getPapers(groupId?: number): Promise<any[]> {
    const query = groupId ? `?groupId=${groupId}` : '';
    const papers = await this.makeRequest(`/papers${query}`);
    
    // Fetch submissions for each paper to allow precise client-side status computation (mock environment)
    const papersWithSubmissions = await Promise.all(papers.map(async (paper: any) => {
      try {
        const submissions = await this.makeRequest(`/submissions?paperId=${paper.id}&_sort=submittedAt&_order=desc&_embed=feedbacks`);
        return { ...paper, submissions };
      } catch (e) {
        return { ...paper, submissions: [] };
      }
    }));
    return papersWithSubmissions;
  }

  async getPaperById(id: string | number): Promise<ResearchPaper> {
    return await this.makeRequest(`/papers/${id}`);
  }

  // @TODO (Backend Developer): 
  // 1. MOBILE API EXPOSURE: The mobile app communicates via REST APIs (JSON payloads), 
  //    but the Next.js backend currently relies entirely on Server Actions. You will need to 
  //    expose API routes (e.g., `app/api/papers/[id]/route.ts`) to accept incoming requests.
  // 2. MISSING UPDATE LOGIC: The backend repo is currently missing the service and action logic 
  //    for updating a research paper. While `updateResearchPaper` exists in the repository layer, 
  //    it is not wired up to any service or API. The mobile app's `updatePaper` method sends a 
  //    PATCH request that precisely matches the Drizzle schema `{title, abstract, category, keywords}`.
  async createPaper(paperData: Partial<ResearchPaper>): Promise<ResearchPaper> {
    return await this.makeRequest('/papers', {
      method: 'POST',
      body: JSON.stringify(paperData),
    });
  }

  async updatePaper(id: string | number, paperData: Partial<ResearchPaper>): Promise<ResearchPaper> {
    return await this.makeRequest(`/papers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(paperData),
    });
  }

  // --- Submissions ---
  async getSubmissions(paperId: string | number): Promise<any[]> {
    return await this.makeRequest(`/submissions?paperId=${paperId}&_sort=submittedAt&_order=desc&_embed=feedbacks`);
  }

  // --- Groups & Users ---
  async getGroup(groupId: number): Promise<ResearchGroup & { group_members?: any[] }> {
    const group = await this.makeRequest(`/research_groups/${groupId}`);
    const members = await this.makeRequest(`/group_members?groupId=${groupId}`);
    return { ...group, group_members: members };
  }

  async getUser(userId: number): Promise<User> {
    return await this.makeRequest(`/users/${userId}`);
  }

  // @TODO (Backend Developer): Similar to updatePaper, the backend currently lacks an update 
  // service/action and REST API route for users. This sends a PATCH request to /users/:id.
  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    return await this.makeRequest(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // @TODO (Backend Developer): Missing change password endpoint.
  // Using PATCH /users/:id here temporarily so the mock server succeeds.
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<any> {
    return await this.makeRequest(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ password: newPassword }),
    });
  }

  async getGroupMembership(userId: number): Promise<any> {
    const members = await this.makeRequest(`/group_members?userId=${userId}`);
    return members.length > 0 ? members[0] : null; 
  }

  async getGroupMembers(groupId: number | string): Promise<any[]> {
    return await this.makeRequest(`/group_members?groupId=${groupId}&_expand=user`);
  }

  // --- Document Upload & Submission ---
  async submitResearchDocument(
    fileUri: string, 
    fileName: string, 
    paperId: string | number, 
    remarks: string = ''
  ): Promise<any> {
    const token = await this.getAuthToken();
    const axios = require('axios').default || require('axios');
    
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: 'application/pdf'
      } as any);
      formData.append('paperId', paperId.toString());
      formData.append('remarks', remarks || '');

      const response = await axios.post(`${BASE_URL}/submissions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      return response.data;
    } catch (e: any) {
      console.error('Error uploading document via axios:', e?.response?.data || e.message);
      throw new Error(`Upload failed: ${e?.response?.data?.message || e.message}`);
    }
  }
}

export const apiService = new ApiService();
export default apiService;
