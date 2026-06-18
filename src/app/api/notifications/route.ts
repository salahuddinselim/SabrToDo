import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, appendRow } from '@/lib/sheets';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    const notifications = await getAllRows('notifications');
    const userNotifications = notifications
      .filter((n) => n.user_id === userId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 20)
      .map((n) => ({ ...n, is_read: n.is_read === 'true' }));

    return NextResponse.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, title, message, task_id } = body;

    if (!user_id || !type || !title) {
      return NextResponse.json(
        { error: 'user_id, type, and title are required' },
        { status: 400 }
      );
    }

    const notification = {
      id: randomUUID(),
      user_id,
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
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
