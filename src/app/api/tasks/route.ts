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

    const tasks = await getAllRows('tasks');
    const userTasks = tasks
      .filter((t) => t.user_id === userId)
      .sort(
        (a, b) =>
          Number(a.order_index) - Number(b.order_index) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    return NextResponse.json(userTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, title, description, due_date, priority, status, notify_before } = body;

    if (!user_id || !title) {
      return NextResponse.json(
        { error: 'user_id and title are required' },
        { status: 400 }
      );
    }

    const tasks = await getAllRows('tasks');
    const maxOrder = tasks
      .filter((t) => t.user_id === user_id)
      .reduce((max, t) => Math.max(max, Number(t.order_index || 0)), 0);

    const newTask = {
      id: randomUUID(),
      user_id,
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
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
