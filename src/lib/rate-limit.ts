const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
};

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; remainingAttempts: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
      resetInMs: config.windowMs,
    };
  }

  if (record.count >= config.maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetInMs: record.resetTime - now,
    };
  }

  record.count += 1;
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - record.count,
    resetInMs: record.resetTime - now,
  };
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

export const authRateLimitConfig: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
};

export const passwordResetRateLimitConfig: RateLimitConfig = {
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000,
};

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);
