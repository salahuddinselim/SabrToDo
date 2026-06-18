import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, appendRow } from '@/lib/sheets';
import { requireAuthForRequest, addRateLimitHeaders, handleApiError } from '@/lib/api-auth';

interface TaskResponse {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  notify_before: number;
  created_at: string;
  completed_at: string;
  order_index: number;
}

function toTaskResponse(row: Record<string, string>): TaskResponse {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    due_date: row.due_date || '',
    priority: row.priority || 'medium',
    status: row.status || 'pending',
    notify_before: Number(row.notify_before ?? 15),
    created_at: row.created_at,
    completed_at: row.completed_at || '',
    order_index: Number(row.order_index || 0),
  };
}

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
      )
      .map(toTaskResponse);

    const response = NextResponse.json(userTasks);
    return addRateLimitHeaders(response, user.id);
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

    const now = new Date().toISOString();
    const newTask = {
      id: randomUUID(),
      user_id: user.id,
      title,
      description: description || '',
      due_date: due_date || '',
      priority: priority || 'medium',
      status: status || 'pending',
      notify_before: String(notify_before ?? 15),
      created_at: now,
      completed_at: '',
      order_index: String(maxOrder + 1),
    };

    await appendRow('tasks', newTask);
    const response = NextResponse.json(toTaskResponse(newTask), { status: 201 });
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}
