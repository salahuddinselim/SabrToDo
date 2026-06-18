import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { appendRow, getAllRows, updateRowByColumn } from '@/lib/sheets';

export async function POST(request: NextRequest) {
  try {
    const { firebaseUid, email, displayName } = await request.json();

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { error: 'firebaseUid and email are required' },
        { status: 400 }
      );
    }

    const users = await getAllRows('users');
    const existing = users.find((u) => u.firebase_uid === firebaseUid);

    if (existing) {
      await updateRowByColumn('users', 'firebase_uid', firebaseUid, {
        ...existing,
        email,
        display_name: displayName || existing.display_name || '',
        updated_at: new Date().toISOString(),
      });
      const updated = await getAllRows('users');
      const user = updated.find((u) => u.firebase_uid === firebaseUid);
      return NextResponse.json(user);
    }

    const newUser = {
      id: randomUUID(),
      firebase_uid: firebaseUid,
      email,
      display_name: displayName || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await appendRow('users', newUser);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    );
  }
}
