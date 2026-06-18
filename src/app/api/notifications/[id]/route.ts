import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateRowByColumn } from '@/lib/sheets';
import { requireAuthForRequest, requireOwnership, handleApiError } from '@/lib/api-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthForRequest(request);

    const notifications = await getAllRows('notifications');
    const notification = notifications.find((n) => n.id === params.id);

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    requireOwnership(user.id, notification.user_id);

    await updateRowByColumn('notifications', 'id', params.id, {
      ...notification,
      is_read: 'true',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
