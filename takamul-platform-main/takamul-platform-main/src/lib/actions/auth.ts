'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

// ==================== SIGN UP ====================
export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;

  // Validate
  if (!email || !password || !fullName || !phone) {
    return { success: false, error: 'جميع الحقول مطلوبة' };
  }

  if (password.length < 8) {
    return { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
  }

  // Validate Saudi phone
  const phoneRegex = /^(05)[0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    return { success: false, error: 'رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' };
    }
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: 'تم إنشاء الحساب بنجاح. يرجى تفعيل حسابك من خلال الرابط المرسل للبريد الإلكتروني.',
  };
}

// ==================== SIGN IN ====================
export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login')) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
    if (error.message.includes('Email not confirmed')) {
      return { success: false, error: 'يرجى تفعيل حسابك من خلال الرابط المرسل للبريد الإلكتروني' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

// ==================== SIGN OUT ====================
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

// ==================== FORGOT PASSWORD ====================
export async function forgotPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, error: 'البريد الإلكتروني مطلوب' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
  };
}

// ==================== RESET PASSWORD ====================
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

  if (password.length < 8) {
    return { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
}

// ==================== GET CURRENT USER ====================
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ==================== CHECK IF HAS FACTORY ====================
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
