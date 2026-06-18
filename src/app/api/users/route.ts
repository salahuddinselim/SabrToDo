import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { appendRow, getAllRows, updateRowByColumn } from '@/lib/sheets';
import { requireAuthForRequest, addRateLimitHeaders, handleApiError } from '@/lib/api-auth';

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
    const { email, displayName } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      );
    }

    const users = await getAllRows('users');
    const existing = users.find((u) => u.firebase_uid === user.id);

    if (existing) {
      await updateRowByColumn('users', 'firebase_uid', user.id, {
        ...existing,
        email,
        display_name: displayName || existing.display_name || '',
        updated_at: new Date().toISOString(),
      });
      const updated = await getAllRows('users');
      const result = updated.find((u) => u.firebase_uid === user.id);
      const response = NextResponse.json(result ? toUserResponse(result) : null);
      return addRateLimitHeaders(response, user.id);
    }

    const now = new Date().toISOString();
    const newUser = {
      id: randomUUID(),
      firebase_uid: user.id,
      email,
      display_name: displayName || '',
      created_at: now,
      updated_at: now,
    };

    await appendRow('users', newUser);
    const response = NextResponse.json(toUserResponse(newUser), { status: 201 });
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}
