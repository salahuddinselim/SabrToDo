interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

function cleanup() {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  });
}

setInterval(cleanup, 60_000);

export function checkRateLimit(
  userId: string,
  consume = true
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(userId);

  if (!entry || entry.resetAt <= now) {
    if (!consume) {
      return { allowed: true, remaining: MAX_REQUESTS, resetAt: now + WINDOW_MS };
    }

    store.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  if (consume) {
    entry.count++;
  }

  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}
