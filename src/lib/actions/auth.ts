'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkRateLimit, authRateLimitConfig, resetRateLimit } from '@/lib/rate-limit';

export interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
  isAdmin?: boolean;
}

function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function sendOtp(email: string, metadata?: { fullName?: string; phone?: string }): Promise<AuthResult> {
  if (!email) {
    return { success: false, error: 'البريد الإلكتروني مطلوب' };
  }

  const sanitizedEmail = sanitizeEmail(email);

  if (!validateEmail(sanitizedEmail)) {
    return { success: false, error: 'البريد الإلكتروني غير صالح' };
  }

  const rateLimit = await checkRateLimit(`otp:${sanitizedEmail}`, authRateLimitConfig);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return { success: false, error: `تم تجاوز عدد المحاولات. حاول مرة أخرى بعد ${minutesLeft} دقيقة` };
  }

  const supabase = await createClient();

  const otpOptions: { email: string; options?: { data?: Record<string, string> } } = {
    email: sanitizedEmail,
  };

  if (metadata?.fullName || metadata?.phone) {
    otpOptions.options = {
      data: {
        ...(metadata.fullName && { full_name: metadata.fullName.trim().slice(0, 100) }),
        ...(metadata.phone && { phone: metadata.phone.replace(/[^0-9]/g, '').slice(0, 15) }),
      },
    };
  }

  const { error } = await supabase.auth.signInWithOtp(otpOptions);

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء إرسال الكود. يرجى المحاولة مرة أخرى' };
  }

  return {
    success: true,
    message: 'تم إرسال الكود إلى بريدك الإلكتروني',
  };
}

export async function signUpWithOtp(
  email: string,
  fullName: string,
  phone: string
): Promise<AuthResult> {
  if (!email || !fullName || !phone) {
    return { success: false, error: 'جميع الحقول مطلوبة' };
  }

  const sanitizedEmail = sanitizeEmail(email);

  if (!validateEmail(sanitizedEmail)) {
    return { success: false, error: 'البريد الإلكتروني غير صالح' };
  }

  const phoneRegex = /^(05)[0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    return { success: false, error: 'رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)' };
  }

  if (fullName.trim().length < 2) {
    return { success: false, error: 'الاسم يجب أن يكون حرفين على الأقل' };
  }

  const rateLimit = await checkRateLimit(`signup:${sanitizedEmail}`, authRateLimitConfig);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return { success: false, error: `تم تجاوز عدد المحاولات. حاول مرة أخرى بعد ${minutesLeft} دقيقة` };
  }

  const sanitizedFullName = fullName.trim().slice(0, 100);
  const sanitizedPhone = phone.replace(/[^0-9]/g, '').slice(0, 15);

  return sendOtp(sanitizedEmail, { fullName: sanitizedFullName, phone: sanitizedPhone });
}

export async function verifyOtp(email: string, token: string): Promise<AuthResult> {
  if (!email || !token) {
    return { success: false, error: 'البريد الإلكتروني والكود مطلوبان' };
  }

  const sanitizedEmail = sanitizeEmail(email);

  if (!validateEmail(sanitizedEmail)) {
    return { success: false, error: 'البريد الإلكتروني غير صالح' };
  }

  if (token.length !== 6 || !/^\d{6}$/.test(token)) {
    return { success: false, error: 'الكود يجب أن يكون 6 أرقام' };
  }

  const rateLimit = await checkRateLimit(`verify:${sanitizedEmail}`, authRateLimitConfig);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return { success: false, error: `تم تجاوز عدد المحاولات. حاول مرة أخرى بعد ${minutesLeft} دقيقة` };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email: sanitizedEmail,
    token,
    type: 'email',
  });

  if (error) {
    if (error.message.includes('expired')) {
      return { success: false, error: 'انتهت صلاحية الكود. يرجى طلب كود جديد' };
    }
    return { success: false, error: 'الكود غير صحيح. يرجى المحاولة مرة أخرى' };
  }

  await resetRateLimit(`verify:${sanitizedEmail}`);
  await resetRateLimit(`otp:${sanitizedEmail}`);
  await resetRateLimit(`signup:${sanitizedEmail}`);

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
    .eq('is_active', true)
    .in('role', ['admin', 'super_admin'])
    .maybeSingle();

  revalidatePath('/', 'layout');
  return { success: true, isAdmin: !!roleData };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserFactory() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: factory } = await supabase
    .from('factories')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return factory;
}
