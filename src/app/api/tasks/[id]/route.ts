import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateRowByColumn, deleteRowByColumn } from '@/lib/sheets';
import { requireAuthForRequest, requireOwnership, handleApiError } from '@/lib/api-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthForRequest(request);
    const updates = await request.json();

    const tasks = await getAllRows('tasks');
    const task = tasks.find((t) => t.id === params.id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    requireOwnership(user.id, task.user_id);

    const updated = { ...task, ...updates, user_id: task.user_id };
    await updateRowByColumn('tasks', 'id', params.id, updated);

    const updatedTasks = await getAllRows('tasks');
    const result = updatedTasks.find((t) => t.id === params.id);
    return NextResponse.json(result);
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
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
