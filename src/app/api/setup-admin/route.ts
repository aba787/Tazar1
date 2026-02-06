import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'super_admin')
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      message: 'أنت بالفعل أدمن!',
      user_id: user.id,
      email: user.email,
      redirect: '/admin'
    });
  }

  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: user.id,
      role: 'super_admin',
      is_active: true,
    });

  if (error) {
    return NextResponse.json({
      error: 'فشل في إضافة الصلاحية',
      details: error.message,
      user_id: user.id
    }, { status: 500 });
  }

  return NextResponse.json({
    message: 'تم تفعيل صلاحية الأدمن بنجاح!',
    user_id: user.id,
    email: user.email,
    redirect: '/admin'
  });
}
