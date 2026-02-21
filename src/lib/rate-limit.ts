import { createClient } from '@/lib/supabase/server';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
};

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = defaultConfig
): Promise<{ allowed: boolean; remainingAttempts: number; resetInMs: number }> {
  const supabase = await createClient();
  const now = new Date();
  const resetTime = new Date(now.getTime() + config.windowMs);

  try {
    // Get existing record
    const { data: existingRecord, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('key', key)
      .single();

    // If record doesn't exist or is expired, create a new one
    if (fetchError || !existingRecord || new Date(existingRecord.reset_time) < now) {
      const { error: upsertError } = await supabase
        .from('rate_limits')
        .upsert(
          {
            key,
            count: 1,
            reset_time: resetTime.toISOString(),
          },
          { onConflict: 'key' }
        );

      if (upsertError) {
        console.error('Rate limit upsert error:', upsertError);
      }

      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - 1,
        resetInMs: config.windowMs,
      };
    }

    // If count >= maxAttempts, reject
    if (existingRecord.count >= config.maxAttempts) {
      const resetDate = new Date(existingRecord.reset_time);
      return {
        allowed: false,
        remainingAttempts: 0,
        resetInMs: Math.max(0, resetDate.getTime() - now.getTime()),
      };
    }

    // Increment count
    const newCount = existingRecord.count + 1;
    const { error: updateError } = await supabase
      .from('rate_limits')
      .update({ count: newCount })
      .eq('key', key);

    if (updateError) {
      console.error('Rate limit update error:', updateError);
    }

    const resetDate = new Date(existingRecord.reset_time);
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - newCount,
      resetInMs: Math.max(0, resetDate.getTime() - now.getTime()),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow the request if there's a database error
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
      resetInMs: config.windowMs,
    };
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('rate_limits')
      .delete()
      .eq('key', key);

    if (error) {
      console.error('Rate limit reset error:', error);
    }
  } catch (error) {
    console.error('Rate limit reset error:', error);
  }
}

export const authRateLimitConfig: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
};

export const passwordResetRateLimitConfig: RateLimitConfig = {
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000,
};

export const adminRateLimitConfig: RateLimitConfig = {
  maxAttempts: 10,
  windowMs: 5 * 60 * 1000,
};

export const dealCreationRateLimitConfig: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 10 * 60 * 1000,
};
