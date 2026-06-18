import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { appendRow, getAllRows, updateRowByColumn } from '@/lib/sheets';
import { requireAuthForRequest, handleApiError } from '@/lib/api-auth';

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
      return NextResponse.json(result);
    }

    const newUser = {
      id: randomUUID(),
      firebase_uid: user.id,
      email,
      display_name: displayName || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await appendRow('users', newUser);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
