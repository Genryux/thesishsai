import { z } from 'zod';

/**
 * Client-side login validation.
 *
 * Mirrors `loginSchema` in the backend repo (`lib/validations/auth.ts`) so the
 * mobile app rejects the same inputs the server would, before any network
 * request is made. The server remains the source of truth — this only exists
 * to give fast feedback and avoid sending obviously invalid payloads.
 *
 * Keep these limits in sync with the backend.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254; // RFC 5321 practical maximum

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .max(EMAIL_MAX_LENGTH, 'Email address is too long')
    .pipe(z.email('Invalid email address')),

  // Passwords are never trimmed or transformed — whitespace is significant.
  password: z
    .string()
    .min(1, 'Password is required')
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`)
    .max(PASSWORD_MAX_LENGTH, `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`),
});

export type LoginInput = z.infer<typeof loginSchema>;
