import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateMultipleRows } from '@/lib/sheets';

export async function POST(request: NextRequest) {
  try {
    const { userId, taskIds } = await request.json();

    if (!userId || !taskIds) {
      return NextResponse.json(
        { error: 'userId and taskIds are required' },
        { status: 400 }
      );
    }

    const tasks = await getAllRows('tasks');
    const updates = taskIds.map((id: string, index: number) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return null;
      return {
        matchValue: id,
        data: { ...task, order_index: String(index) },
      };
    }).filter(Boolean) as Array<{ matchValue: string; data: Record<string, string> }>;

    await updateMultipleRows('tasks', 'id', updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    return NextResponse.json(
      { error: 'Failed to reorder tasks' },
      { status: 500 }
    );
  }
}
