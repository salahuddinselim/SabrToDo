import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { validateCSRFToken } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limit';

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email || undefined,
    name: session.user.name || undefined,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new ApiError(401, 'Authentication required');
  }
  return user;
}

export function requireOwnership(sessionUserId: string, resourceUserId: string): void {
  if (sessionUserId !== resourceUserId) {
    throw new ApiError(403, 'You do not have permission to access this resource');
  }
}

export async function requireAuthForRequest(request: Request): Promise<AuthUser> {
  const user = await requireAuth();

  const rateLimit = checkRateLimit(user.id);
  if (!rateLimit.allowed) {
    throw new ApiError(429, `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.`);
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const csrfToken = request.headers.get('x-csrf-token');
    if (csrfToken) {
      if (!validateCSRFToken(csrfToken, user.id)) {
        throw new ApiError(403, 'Invalid CSRF token');
      }
    } else {
      console.warn('CSRF token missing from request — session may need refresh. User:', user.id);
    }
  }

  return user;
}

export function addRateLimitHeaders(response: NextResponse, userId: string): NextResponse {
  const rateLimit = checkRateLimit(userId);
  response.headers.set('X-RateLimit-Limit', String(60));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimit.resetAt / 1000)));
  return response;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }
  console.error('Unhandled API error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
