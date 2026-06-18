import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, appendRow } from '@/lib/sheets';
import { requireAuthForRequest, requireOwnership, handleApiError } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);

    const tasks = await getAllRows('tasks');
    const userTasks = tasks
      .filter((t) => t.user_id === user.id)
      .sort(
        (a, b) =>
          Number(a.order_index) - Number(b.order_index) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    return NextResponse.json(userTasks);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);
    const body = await request.json();
    const { title, description, due_date, priority, status, notify_before } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    const tasks = await getAllRows('tasks');
    const maxOrder = tasks
      .filter((t) => t.user_id === user.id)
      .reduce((max, t) => Math.max(max, Number(t.order_index || 0)), 0);

    const newTask = {
      id: randomUUID(),
      user_id: user.id,
      title,
      description: description || '',
      due_date: due_date || '',
      priority: priority || 'medium',
      status: status || 'pending',
      notify_before: String(notify_before ?? 15),
      created_at: new Date().toISOString(),
      completed_at: '',
      order_index: String(maxOrder + 1),
    };

    await appendRow('tasks', newTask);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
