import { createHash, timingSafeEqual } from 'crypto';

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not set');
  }
  return secret;
}

export function createCSRFToken(userId: string): string {
  const secret = getSecret();
  const payload = `${userId}:${secret}`;
  return createHash('sha256').update(payload).digest('hex');
}

export function validateCSRFToken(token: string, userId: string): boolean {
  const expected = createCSRFToken(userId);
  const tokenBuf = Buffer.from(token);
  const expectedBuf = Buffer.from(expected);
  if (tokenBuf.length !== expectedBuf.length) return false;
  try {
    return timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}
