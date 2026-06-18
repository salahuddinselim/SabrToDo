import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateMultipleRows } from '@/lib/sheets';
import { requireAuthForRequest, requireOwnership, addRateLimitHeaders, handleApiError } from '@/lib/api-auth';
import { reorderSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);
    const body = await request.json();

    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { taskIds } = parsed.data;

    const tasks = await getAllRows('tasks');
    const updates = taskIds.map((id, index) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return null;
      requireOwnership(user.id, task.user_id);
      return {
        matchValue: id,
        data: { ...task, order_index: String(index) },
      };
    }).filter(Boolean) as Array<{ matchValue: string; data: Record<string, string> }>;

    await updateMultipleRows('tasks', 'id', updates);
    const response = NextResponse.json({ success: true });
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}
