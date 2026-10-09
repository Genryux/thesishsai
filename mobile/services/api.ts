import * as SecureStore from 'expo-secure-store';

// Assuming local testing for now. Use an IP address for testing on physical devices, or localhost for emulators.
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000'; // 10.0.2.2 is Android emulator's localhost

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
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

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('authToken');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAuthToken();
    
    // Add auth headers if token exists
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle non-JSON responses gracefully
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Unexpected response: ${text.slice(0, 200)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  // --- Auth ---
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data;
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('authToken');
  }

  // --- Papers ---
  async getPapers(groupId?: number): Promise<ResearchPaper[]> {
    const query = groupId ? `?groupId=${groupId}` : '';
    return await this.makeRequest(`/papers${query}`);
  }

  async getPaperById(id: number): Promise<ResearchPaper> {
    return await this.makeRequest(`/papers/${id}`);
  }

  async createPaper(paperData: Partial<ResearchPaper>): Promise<ResearchPaper> {
    return await this.makeRequest('/papers', {
      method: 'POST',
      body: JSON.stringify(paperData),
    });
  }

  // --- Submissions ---
  async getSubmissions(paperId: number): Promise<any[]> {
    return await this.makeRequest(`/submissions?paperId=${paperId}&_sort=submittedAt&_order=desc&_embed=feedbacks`);
  }

  // --- Groups & Users ---
  async getGroup(groupId: number): Promise<ResearchGroup & { group_members?: any[] }> {
    // We use _embed=group_members, a feature of json-server!
    return await this.makeRequest(`/research_groups/${groupId}?_embed=group_members`);
  }

  async getUser(userId: number): Promise<User> {
    return await this.makeRequest(`/users/${userId}`);
  }

  async getGroupMembership(userId: number): Promise<any> {
    const members = await this.makeRequest(`/group_members?userId=${userId}`);
    return members.length > 0 ? members[0] : null; 
  }

  // --- Document Upload & Submission ---
  async submitResearchDocument(
    fileUri: string, 
    fileName: string, 
    paperId: number, 
    remarks: string = ''
  ): Promise<any> {
    const token = await this.getAuthToken();
    const axios = require('axios').default;
    
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: 'application/pdf'
    } as any);
    
    formData.append('paperId', paperId.toString());
    formData.append('remarks', remarks);

    try {
      const response = await axios.post(`${BASE_URL}/submissions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      return response.data;
    } catch (e: any) {
      console.error('Error uploading document via axios:', e.response?.data || e.message);
      throw new Error(`Upload failed: ${e.message}`);
    }
  }
}

export const apiService = new ApiService();
export default apiService;
