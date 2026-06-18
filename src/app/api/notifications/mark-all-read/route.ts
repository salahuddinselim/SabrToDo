import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateMultipleRows } from '@/lib/sheets';
import { requireAuthForRequest, handleApiError } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);

    const notifications = await getAllRows('notifications');
    const unread = notifications.filter(
      (n) => n.user_id === user.id && n.is_read === 'false'
    );

    if (unread.length === 0) {
      return NextResponse.json({ success: true });
    }

    const updates = unread.map((n) => ({
      matchValue: n.id,
      data: { ...n, is_read: 'true' },
    }));

    await updateMultipleRows('notifications', 'id', updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
