import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getAllRows } from '@/lib/sheets';

webpush.setVapidDetails(
  'mailto:hello@sabrflow.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const tasks = await getAllRows('tasks');

    const dueSoon = tasks.filter((t) => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return false;
      const due = new Date(t.due_date);
      return due > now && due <= oneHourLater;
    });

    if (dueSoon.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const subscriptions = await getAllRows('push_subscriptions');
    const userTasks = new Map<string, typeof dueSoon>();

    for (const task of dueSoon) {
      const existing = userTasks.get(task.user_id) || [];
      existing.push(task);
      userTasks.set(task.user_id, existing);
    }

    let sent = 0;

    const entries = Array.from(userTasks.entries());
    for (let ei = 0; ei < entries.length; ei++) {
      const [userId, userDueTasks] = entries[ei];
      const userSubs = subscriptions.filter((s) => s.user_id === userId);

      for (const task of userDueTasks) {
        for (const sub of userSubs) {
          let subscription: webpush.PushSubscription;
          try {
            subscription = JSON.parse(sub.subscription);
          } catch {
            continue;
          }

          try {
            await webpush.sendNotification(subscription, JSON.stringify({
              title: 'Task due soon',
              body: `"${task.title}" is due in less than an hour`,
              icon: '/icon-192.png',
            }));
            sent++;
          } catch {
            continue;
          }
        }
      }
    }

    return NextResponse.json({ sent, totalTasks: dueSoon.length });
  } catch (error) {
    console.error('Cron reminders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
