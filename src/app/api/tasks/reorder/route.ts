import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateMultipleRows, backfillUserEmail, emailMatches } from '@/lib/sheets';
import { requireAuthForRequest, requireOwnership, addRateLimitHeaders, handleApiError, ApiError } from '@/lib/api-auth';
import { reorderSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);
    await backfillUserEmail(user.id, user.email);
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
      const ownsById = task.user_id === user.id;
      const ownsByEmail = task.user_email && emailMatches(task.user_email, user.email);
      if (!ownsById && !ownsByEmail) {
        throw new ApiError(403, 'You do not have permission to reorder this task');
      }
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
