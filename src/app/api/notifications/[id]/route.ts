import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateRowByColumn, backfillUserEmail } from '@/lib/sheets';
import { requireAuthForRequest, requireOwnership, addRateLimitHeaders, handleApiError, ApiError } from '@/lib/api-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthForRequest(request);

    await backfillUserEmail(user.id, user.email);

    const notifications = await getAllRows('notifications');
    const notification = notifications.find((n) => n.id === params.id);

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    const ownsById = notification.user_id === user.id;
    const ownsByEmail = notification.user_email && emailMatches(notification.user_email, user.email);
    if (!ownsById && !ownsByEmail) {
      throw new ApiError(403, 'You do not have permission to modify this notification');
    }

    await updateRowByColumn('notifications', 'id', params.id, {
      ...notification,
      is_read: 'true',
    });

    const response = NextResponse.json({ success: true });
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}
