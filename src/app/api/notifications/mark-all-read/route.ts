import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateMultipleRows, backfillUserEmail, emailMatches } from '@/lib/sheets';
import { requireAuthForRequest, addRateLimitHeaders, handleApiError } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);
    await backfillUserEmail(user.id, user.email);

    const notifications = await getAllRows('notifications');
    const unread = notifications.filter(
      (n) => (emailMatches(n.user_email, user.email) || n.user_id === user.id) && n.is_read === 'false'
    );

    if (unread.length === 0) {
      const response = NextResponse.json({ success: true });
      return addRateLimitHeaders(response, user.id);
    }

    const updates = unread.map((n) => ({
      matchValue: n.id,
      data: { ...n, is_read: 'true' },
    }));

    await updateMultipleRows('notifications', 'id', updates);
    const response = NextResponse.json({ success: true });
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}
