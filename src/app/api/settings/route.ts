import { NextRequest, NextResponse } from 'next/server';
import { getAllRows, updateRowByColumn, appendRow, backfillUserEmail, emailMatches } from '@/lib/sheets';
import { requireAuthForRequest, addRateLimitHeaders, handleApiError } from '@/lib/api-auth';
import { randomUUID } from 'crypto';

interface SettingsResponse {
  daily_goal: number;
  selected_theme: string;
  notif_states: Record<string, boolean>;
  sec_states: Record<string, boolean>;
}

const defaultSettings: SettingsResponse = {
  daily_goal: 5,
  selected_theme: 'ocean',
  notif_states: { push: true, alarm: true, digest: false, overdue: true, goal: true, report: false },
  sec_states: { timeout: true, login: true, audit: false },
};

function toSettingsResponse(row: Record<string, string>): SettingsResponse {
  return {
    daily_goal: Number(row.daily_goal ?? defaultSettings.daily_goal),
    selected_theme: row.selected_theme || defaultSettings.selected_theme,
    notif_states: (() => {
      try { return { ...defaultSettings.notif_states, ...JSON.parse(row.notif_states || '{}') }; }
      catch { return { ...defaultSettings.notif_states }; }
    })(),
    sec_states: (() => {
      try { return { ...defaultSettings.sec_states, ...JSON.parse(row.sec_states || '{}') }; }
      catch { return { ...defaultSettings.sec_states }; }
    })(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);

    await backfillUserEmail(user.id, user.email);

    const settings = await getAllRows('settings');
    const existing = settings.find((s) => emailMatches(s.user_email, user.email) || s.user_id === user.id);

    if (!existing) {
      const now = new Date().toISOString();
      await appendRow('settings', {
        id: randomUUID(),
        user_id: user.id,
        user_email: user.email || '',
        daily_goal: String(defaultSettings.daily_goal),
        selected_theme: defaultSettings.selected_theme,
        notif_states: JSON.stringify(defaultSettings.notif_states),
        sec_states: JSON.stringify(defaultSettings.sec_states),
        updated_at: now,
      });
      const response = NextResponse.json(defaultSettings);
      return addRateLimitHeaders(response, user.id);
    }

    const response = NextResponse.json(toSettingsResponse(existing));
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuthForRequest(request);
    await backfillUserEmail(user.id, user.email);
    const body = await request.json();

    const settings = await getAllRows('settings');
    const existing = settings.find((s) => s.user_email === user.email || s.user_id === user.id);

    if (!existing) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    const updates: Record<string, string> = { updated_at: new Date().toISOString(), user_email: user.email || '' };

    if (body.daily_goal !== undefined) updates.daily_goal = String(body.daily_goal);
    if (body.selected_theme !== undefined) updates.selected_theme = body.selected_theme;
    if (body.notif_states !== undefined) updates.notif_states = JSON.stringify(body.notif_states);
    if (body.sec_states !== undefined) updates.sec_states = JSON.stringify(body.sec_states);

    await updateRowByColumn('settings', 'id', existing.id, { ...existing, ...updates });

    const all = await getAllRows('settings');
    const updated = all.find((s) => emailMatches(s.user_email, user.email) || s.user_id === user.id);
    const response = NextResponse.json(updated ? toSettingsResponse(updated) : defaultSettings);
    return addRateLimitHeaders(response, user.id);
  } catch (error) {
    return handleApiError(error);
  }
}
