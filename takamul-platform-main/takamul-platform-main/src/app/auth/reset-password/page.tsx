'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, Factory, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { resetPassword } from '@/lib/actions/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
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

    const result = await resetPassword(formData);

    if (result.success) {
      setSuccess(true);
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      setFormError(result.error || 'حدث خطأ غير متوقع');
    }
    setIsLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold mb-4">تم تغيير كلمة المرور!</h1>
          <p className="text-muted-foreground mb-8">
            تم تغيير كلمة المرور بنجاح. سيتم تحويلك لصفحة تسجيل الدخول تلقائياً...
          </p>
          <Link href="/login">
            <Button className="w-full">تسجيل الدخول الآن</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
          <h1 className="text-2xl font-bold">إعادة تعيين كلمة المرور</h1>
          <p className="text-muted-foreground mt-2">
            أدخل كلمة المرور الجديدة
          </p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
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
              <label className="text-sm font-medium">كلمة المرور الجديدة</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="********"
                  required
                  minLength={8}
                  className="w-full h-12 pr-10 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">يجب أن تتكون من 8 أحرف على الأقل</p>
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
                  className="w-full h-12 pr-10 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ كلمة المرور الجديدة'
              )}
            </Button>
          </form>
        </div>

        {/* Back to Login */}
        <p className="text-center mt-6 text-muted-foreground">
          تذكرت كلمة المرور؟{' '}
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            سجّل دخولك
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
