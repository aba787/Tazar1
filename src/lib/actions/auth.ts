'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkRateLimit, authRateLimitConfig, passwordResetRateLimitConfig, resetRateLimit } from '@/lib/rate-limit';

export interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'كلمة المرور طويلة جداً' };
  }
  return { valid: true };
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;

  if (!email || !password || !fullName || !phone) {
    return { success: false, error: 'جميع الحقول مطلوبة' };
  }

  const sanitizedEmail = sanitizeEmail(email);
  
  if (!validateEmail(sanitizedEmail)) {
    return { success: false, error: 'البريد الإلكتروني غير صالح' };
  }

  const rateLimit = checkRateLimit(`signup:${sanitizedEmail}`, authRateLimitConfig);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return { success: false, error: `تم تجاوز عدد المحاولات. حاول مرة أخرى بعد ${minutesLeft} دقيقة` };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error };
  }

  const phoneRegex = /^(05)[0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    return { success: false, error: 'رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)' };
  }

  const sanitizedFullName = fullName.trim().slice(0, 100);
  const sanitizedPhone = phone.replace(/[^0-9]/g, '').slice(0, 15);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.signUp({
    email: sanitizedEmail,
    password,
    options: {
      data: {
        full_name: sanitizedFullName,
        phone: sanitizedPhone,
      },
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' };
    }
    return { success: false, error: 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى' };
  }

  return {
    success: true,
    message: 'تم إنشاء الحساب بنجاح. يرجى تفعيل حسابك من خلال الرابط المرسل للبريد الإلكتروني.',
  };
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' };
  }

  const sanitizedEmail = sanitizeEmail(email);

  const rateLimit = checkRateLimit(`signin:${sanitizedEmail}`, authRateLimitConfig);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return { success: false, error: `تم تجاوز عدد المحاولات. حاول مرة أخرى بعد ${minutesLeft} دقيقة` };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: sanitizedEmail,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login')) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
    if (error.message.includes('Email not confirmed')) {
      return { success: false, error: 'يرجى تفعيل حسابك من خلال الرابط المرسل للبريد الإلكتروني' };
    }
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى' };
  }

  resetRateLimit(`signin:${sanitizedEmail}`);
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function forgotPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, error: 'البريد الإلكتروني مطلوب' };
  }

  const sanitizedEmail = sanitizeEmail(email);

  if (!validateEmail(sanitizedEmail)) {
    return { success: false, error: 'البريد الإلكتروني غير صالح' };
  }

  const rateLimit = checkRateLimit(`reset:${sanitizedEmail}`, passwordResetRateLimitConfig);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return { success: false, error: `تم تجاوز عدد المحاولات. حاول مرة أخرى بعد ${minutesLeft} دقيقة` };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
    redirectTo: `${appUrl}/auth/reset-password`,
  });

  return {
    success: true,
    message: 'إذا كان البريد الإلكتروني مسجلاً، ستتلقى رابط إعادة تعيين كلمة المرور',
  };
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    return { success: false, error: 'جميع الحقول مطلوبة' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'كلمتا المرور غير متطابقتين' };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى' };
  }

  return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
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
