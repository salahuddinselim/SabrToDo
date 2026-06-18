import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateMultipleRows } from '@/lib/sheets';
import { requireAuthForRequest, requireOwnership, handleApiError } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);
    const { taskIds } = await request.json();

    if (!taskIds) {
      return NextResponse.json(
        { error: 'taskIds is required' },
        { status: 400 }
      );
    }

    const tasks = await getAllRows('tasks');
    const updates = taskIds.map((id: string, index: number) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return null;
      requireOwnership(user.id, task.user_id);
      return {
        matchValue: id,
        data: { ...task, order_index: String(index) },
      };
    }).filter(Boolean) as Array<{ matchValue: string; data: Record<string, string> }>;

    await updateMultipleRows('tasks', 'id', updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
