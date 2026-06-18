import { NextRequest, NextResponse } from 'next/server';
import { getAllRows } from '@/lib/sheets';
import { requireAuthForRequest, requireOwnership, handleApiError } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { firebaseUid: string } }
) {
  try {
    const user = await requireAuthForRequest(request);
    requireOwnership(user.id, params.firebaseUid);

    const users = await getAllRows('users');
    const userData = users.find((u) => u.firebase_uid === params.firebaseUid);

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    return handleApiError(error);
  }
}
