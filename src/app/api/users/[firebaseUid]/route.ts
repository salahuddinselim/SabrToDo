import { NextRequest, NextResponse } from 'next/server';
import { getAllRows } from '@/lib/sheets';

export async function GET(
  _request: NextRequest,
  { params }: { params: { firebaseUid: string } }
) {
  try {
    const users = await getAllRows('users');
    const user = users.find((u) => u.firebase_uid === params.firebaseUid);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
