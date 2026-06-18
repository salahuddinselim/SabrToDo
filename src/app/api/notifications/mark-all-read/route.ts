import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateMultipleRows } from '@/lib/sheets';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const notifications = await getAllRows('notifications');
    const unread = notifications.filter(
      (n) => n.user_id === userId && n.is_read === 'false'
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
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
