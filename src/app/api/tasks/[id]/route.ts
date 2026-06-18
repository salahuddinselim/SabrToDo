import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateRowByColumn, deleteRowByColumn } from '@/lib/sheets';
import { requireAuthForRequest, requireOwnership, addRateLimitHeaders, handleApiError } from '@/lib/api-auth';
import { taskUpdateSchema } from '@/lib/validation';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthForRequest(request);
    const body = await request.json();

    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const tasks = await getAllRows('tasks');
    const task = tasks.find((t) => t.id === params.id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    requireOwnership(user.id, task.user_id);

    const updateData: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      updateData[key] = String(value);
    }
    const updated = { ...task, ...updateData, user_id: task.user_id };
    await updateRowByColumn('tasks', 'id', params.id, updated);

    const updatedTasks = await getAllRows('tasks');
    const result = updatedTasks.find((t) => t.id === params.id);
    const response = NextResponse.json(result ? toTaskResponse(result) : null);
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthForRequest(request);

    const tasks = await getAllRows('tasks');
    const task = tasks.find((t) => t.id === params.id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    requireOwnership(user.id, task.user_id);

    await deleteRowByColumn('tasks', 'id', params.id);
    const response = NextResponse.json({ success: true });
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}
