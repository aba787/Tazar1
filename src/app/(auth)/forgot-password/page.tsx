'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Loader2, Factory, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { forgotPassword } from '@/lib/actions/auth';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setFormError(null);

    const result = await forgotPassword(formData);

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
          <h1 className="text-2xl font-bold mb-4">تم إرسال الرابط!</h1>
          <p className="text-muted-foreground mb-8">
            تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
            يرجى التحقق من صندوق الوارد واتباع التعليمات.
          </p>
          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full">العودة لتسجيل الدخول</Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              لم يصلك الرابط؟{' '}
              <button
                onClick={() => setSuccess(false)}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                حاول مرة أخرى
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
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
          <h1 className="text-2xl font-bold">نسيت كلمة المرور؟</h1>
          <p className="text-muted-foreground mt-2">
            أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
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
          <form action={handleSubmit} className="space-y-5">
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

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                'إرسال رابط الاستعادة'
              )}
            </Button>
          </form>
        </div>

        {/* Back to Login */}
        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لتسجيل الدخول
        </Link>
      </motion.div>
    </div>
  );
}
