import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, appendRow } from '@/lib/sheets';
import { requireAuthForRequest, requireOwnership, handleApiError } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);

    const notifications = await getAllRows('notifications');
    const userNotifications = notifications
      .filter((n) => n.user_id === user.id)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 20)
      .map((n) => ({ ...n, is_read: n.is_read === 'true' }));

    return NextResponse.json(userNotifications);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);
    const body = await request.json();
    const { type, title, message, task_id } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'type and title are required' },
        { status: 400 }
      );
    }

    const notification = {
      id: randomUUID(),
      user_id: user.id,
      type,
      title,
      message: message || '',
      task_id: task_id || '',
      is_read: 'false',
      created_at: new Date().toISOString(),
    };

    await appendRow('notifications', notification);
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
