import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, syncUserByEmail, updateRowByColumn, normalizeEmail, appendRow } from '@/lib/sheets';
import { requireAuthForRequest, addRateLimitHeaders, handleApiError } from '@/lib/api-auth';
import { userSchema } from '@/lib/validation';

interface UserResponse {
  id: string;
  email: string;
  display_name: string;
}

function toUserResponse(row: Record<string, string>): UserResponse {
  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name || '',
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);
    const body = await request.json();

    const parsed = userSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, displayName } = parsed.data;

    const normalizedEmail = normalizeEmail(email);
    await syncUserByEmail(user.id, normalizedEmail);

    const users = await getAllRows('users');
    const result = users.find((u) => u.firebase_uid === user.id || normalizeEmail(u.email) === normalizedEmail);
    if (!result) {
      const now = new Date().toISOString();
      const newUser = {
        id: randomUUID(),
        firebase_uid: user.id,
        email: normalizedEmail,
        display_name: displayName || '',
        created_at: now,
        updated_at: now,
      };
      await appendRow('users', newUser);
      const response = NextResponse.json(toUserResponse(newUser), { status: 201 });
      return addRateLimitHeaders(response, user.id);
    }

    const updated = {
      ...result,
      email: normalizedEmail,
      display_name: displayName || result.display_name || '',
      updated_at: new Date().toISOString(),
    };
    await updateRowByColumn('users', 'id', result.id, updated);
    const response = NextResponse.json(toUserResponse(updated));
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}
