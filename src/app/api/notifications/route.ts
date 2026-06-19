import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, appendRow, backfillUserEmail, emailMatches } from '@/lib/sheets';
import { requireAuthForRequest, addRateLimitHeaders, handleApiError } from '@/lib/api-auth';
import { notificationSchema } from '@/lib/validation';

interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  task_id: string;
  is_read: boolean;
  created_at: string;
}

function toNotificationResponse(row: Record<string, string>): NotificationResponse {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message || '',
    task_id: row.task_id || '',
    is_read: row.is_read === 'true',
    created_at: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);

    await backfillUserEmail(user.id, user.email);

    const allRows = await getAllRows('notifications');
    const userNotifications = allRows
      .filter((n) => emailMatches(n.user_email, user.email) || n.user_id === user.id)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 20)
      .map(toNotificationResponse);

    const response = NextResponse.json(userNotifications);
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);
    await backfillUserEmail(user.id, user.email);
    const body = await request.json();

    const parsed = notificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { type, title, message, task_id } = parsed.data;

    const now = new Date().toISOString();
    const notification = {
      id: randomUUID(),
      user_id: user.id,
      user_email: user.email || '',
      type,
      title,
      message: message || '',
      task_id: task_id || '',
      is_read: 'false',
      created_at: now,
    };

    await appendRow('notifications', notification);
    const response = NextResponse.json(toNotificationResponse(notification), { status: 201 });
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}
