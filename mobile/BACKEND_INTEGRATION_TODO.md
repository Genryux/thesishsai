# Backend Integration TODOs

This file outlines the missing pieces and requirements for the backend developer when connecting this React Native mobile application to the Next.js backend.

## 1. Missing REST API Routes
The mobile application uses standard `fetch`/`axios` requests to interact with REST APIs (`GET`, `POST`, `PATCH`, `DELETE`) with JSON payloads. 
Currently, the Next.js backend relies **exclusively on Server Actions** (using `FormData`) for the web dashboard.
**Action Required:** You need to expose standard Next.js API Routes (e.g., inside `app/api/.../route.ts`) so the mobile app has endpoints to call.

## 2. Incomplete "Update Research Paper" Logic
The mobile application now supports editing a research paper. It sends a `PATCH` request to `/papers/:id` with the following payload structure:
```json
{
  "title": "Updated Title",
  "abstract": "Updated Abstract",
  "category": "Technology",
  "keywords": "AI, Tech"
}
```
**Action Required:**
While `updateResearchPaper` exists in the backend's repository layer (`lib/repositories/research-paper.repository.ts`), it is **not wired up**. 
There is currently no service logic (`student-research.service.ts`) or server action (`student-research.action.ts`) for updating a paper. You need to build the service layer for this update, and then expose it via a REST API route for the mobile app to hit.

## 3. File Upload Handling
The mobile app uses `FormData` to upload PDF documents (in `api.ts` -> `submitResearchDocument`). Ensure the backend API route handles `multipart/form-data` parsing correctly for file uploads coming from a React Native environment.

## 4. Mobile Login Endpoint
The backend only has `loginAction` (Server Action + HTTP-only cookie). Native clients need a JSON route that returns the JWT in the body.
**Action Required:** Add `app/api/auth/login/route.ts` that reuses `loginSchema` + `loginUser` and returns:
```json
// 200
{ "success": true, "message": "Login successful.", "data": { "user": { "id": 1, "firstName": "", "lastName": "", "email": "", "roleId": 3 }, "token": "<jwt from createToken>" } }
// 400 / 401 / 403
{ "success": false, "message": "Invalid email or password." }
```
- Then set `EXPO_PUBLIC_AUTH_LOGIN_PATH=/api/auth/login` and `EXPO_PUBLIC_API_URL=https://...` in the mobile app. (Release builds won't send credentials over plain `http://`.)
- Protected API routes must accept `Authorization: Bearer <token>` (verify with `verifyToken`), since the app doesn't use cookies.
- Add server-side rate limiting on this route (return `429`). The app's own lockout is only a client-side speed bump.

---
*Note: A reminder comment has also been placed directly in `services/api.ts` above the paper methods.*
