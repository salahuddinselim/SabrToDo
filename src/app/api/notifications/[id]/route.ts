import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateRowByColumn } from '@/lib/sheets';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notifications = await getAllRows('notifications');
    const notification = notifications.find((n) => n.id === params.id);

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    await updateRowByColumn('notifications', 'id', params.id, {
      ...notification,
      is_read: 'true',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
