import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateRowByColumn, deleteRowByColumn } from '@/lib/sheets';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const tasks = await getAllRows('tasks');
    const task = tasks.find((t) => t.id === params.id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updated = { ...task, ...updates };
    await updateRowByColumn('tasks', 'id', params.id, updated);

    const updatedTasks = await getAllRows('tasks');
    const result = updatedTasks.find((t) => t.id === params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = await getAllRows('tasks');
    const task = tasks.find((t) => t.id === params.id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await deleteRowByColumn('tasks', 'id', params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
