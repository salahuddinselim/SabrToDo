import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { validateCSRFToken } from '@/lib/csrf';

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
  const csrfToken = request.headers.get('x-csrf-token');
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (!csrfToken || !validateCSRFToken(csrfToken, user.id)) {
      throw new ApiError(403, 'Invalid or missing CSRF token');
    }
  }
  return user;
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
