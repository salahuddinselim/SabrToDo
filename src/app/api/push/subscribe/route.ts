import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, appendRow, deleteRowByColumn } from '@/lib/sheets';
import { requireAuthForRequest, addRateLimitHeaders, handleApiError } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);
    const body = await request.json();

    if (!body.subscription || !body.subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const subscriptionJson = JSON.stringify(body.subscription);

    const existing = await getAllRows('push_subscriptions');
    const alreadyExists = existing.find(
      (row) => row.user_id === user.id && row.endpoint === body.subscription.endpoint
    );

    if (!alreadyExists) {
      await appendRow('push_subscriptions', {
        id: crypto.randomUUID(),
        user_id: user.id,
        endpoint: body.subscription.endpoint,
        subscription: subscriptionJson,
        created_at: new Date().toISOString(),
      });
    }

    const response = NextResponse.json({ ok: true });
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (endpoint) {
      const rows = await getAllRows('push_subscriptions');
      const match = rows.find(
        (r) => r.user_id === user.id && r.endpoint === endpoint
      );
      if (match) {
        await deleteRowByColumn('push_subscriptions', 'id', match.id);
      }
    }

    const response = NextResponse.json({ ok: true });
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}
