import { NextRequest, NextResponse } from 'next/server';
import { getAllRows } from '@/lib/sheets';
import { requireAuthForRequest, requireOwnership, addRateLimitHeaders, handleApiError } from '@/lib/api-auth';

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

    const response = NextResponse.json(toUserResponse(userData));
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}
