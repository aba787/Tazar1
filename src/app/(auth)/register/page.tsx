'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Factory, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { signUp } from '@/lib/actions/auth';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setFormError(null);

    // Client-side validation
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setFormError('كلمتا المرور غير متطابقتين');
      setIsLoading(false);
      return;
    }

    const result = await signUp(formData);

    if (result.success) {
      setSuccess(true);
    } else {
      setFormError(result.error || 'حدث خطأ غير متوقع');
    }
    setIsLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold mb-4">تم إنشاء الحساب بنجاح!</h1>
          <p className="text-muted-foreground mb-8">
            تم إرسال رابط التفعيل إلى بريدك الإلكتروني.
            يرجى التحقق من صندوق الوارد وتفعيل حسابك للمتابعة.
          </p>
          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full">العودة لتسجيل الدخول</Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              لم يصلك الرابط؟{' '}
              <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                إعادة الإرسال
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-600 to-green-700 text-white p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border-4 border-white rounded-full" />
          <div className="absolute bottom-20 left-20 w-96 h-96 border-4 border-white rounded-full" />
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold mb-6">انضم لمنصة تآزر</h2>
          <p className="text-xl text-white/90 mb-8">
            سجّل مصنعك الآن واستفد من قوة الشراء الجماعي وتبادل الطاقة الإنتاجية
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="font-semibold">وفّر حتى 30%</p>
                <p className="text-sm text-white/80">على المواد الخام بالشراء الجماعي</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl">🏭</span>
              </div>
              <div>
                <p className="font-semibold">استثمر طاقتك الفائضة</p>
                <p className="text-sm text-white/80">أجّر معداتك وحقق دخل إضافي</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl">🤝</span>
              </div>
              <div>
                <p className="font-semibold">شبكة مصانع موثوقة</p>
                <p className="text-sm text-white/80">+150 مصنع سعودي مسجل</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white mb-4">
              <Factory className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
            <p className="text-muted-foreground mt-2">سجّل بياناتك للانضمام للمنصة</p>
          </div>

          {/* Error Alert */}
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
            </motion.div>
          )}

          {/* Form */}
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="أحمد محمد العتيبي"
                  required
                  className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">رقم الجوال</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="05XXXXXXXX"
                  required
                  pattern="^(05)[0-9]{8}$"
                  className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  placeholder="example@factory.com"
                  required
                  className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="********"
                    required
                    minLength={8}
                    className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="********"
                    required
                    className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPassword ? 'إخفاء' : 'إظهار'} كلمة المرور
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                أوافق على{' '}
                <Link href="/terms" className="text-emerald-600 hover:underline">
                  شروط الاستخدام
                </Link>
                {' '}و{' '}
                <Link href="/privacy" className="text-emerald-600 hover:underline">
                  سياسة الخصوصية
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                'إنشاء الحساب'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-muted-foreground">
            لديك حساب بالفعل؟{' '}
            <Link
              href="/login"
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              سجّل دخولك
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
