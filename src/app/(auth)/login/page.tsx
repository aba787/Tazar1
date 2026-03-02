'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Loader2, Factory, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui';
import { sendOtp } from '@/lib/actions/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/overview';
  const error = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    error === 'auth_failed' ? 'فشل التحقق من الحساب. يرجى المحاولة مرة أخرى.' : null
  );

  async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    const result = await sendOtp(email);

    if (result.success) {
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirect)}`);
    } else {
      setFormError(result.error || 'حدث خطأ غير متوقع');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-black to-[#575757] text-white mb-4">
              <Factory className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">مرحباً بك</h1>
            <p className="text-muted-foreground mt-2">أدخل بريدك الإلكتروني وسنرسل لك كود الدخول</p>
          </div>

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

          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  placeholder="example@factory.com"
                  required
                  autoComplete="email"
                  className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 focus:ring-black dark:focus:ring-[#E6E6E6] focus:border-transparent transition-all"
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
                  جاري إرسال الكود...
                </>
              ) : (
                <>
                  <Send className="ml-2 h-5 w-5" />
                  إرسال الكود
                </>
              )}
            </Button>
          </form>

          <p className="text-center mt-6 text-muted-foreground">
            ليس لديك حساب؟{' '}
            <Link
              href="/register"
              className="text-foreground hover:text-[#575757] font-medium transition-colors underline"
            >
              سجّل الآن
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-black to-[#575757] text-white p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border-4 border-white rounded-full" />
          <div className="absolute bottom-20 left-20 w-96 h-96 border-4 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-4 border-white rounded-full" />
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-4xl font-bold mb-6">منصة تآزر الصناعية</h2>
          <p className="text-xl text-white/90 mb-8">
            اجمع قوتك الشرائية مع مصانع أخرى ووفّر حتى 30% على المواد الخام
          </p>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-3xl font-bold">156</p>
              <p className="text-sm text-white/80">مصنع مسجل</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-3xl font-bold">2.5M</p>
              <p className="text-sm text-white/80">ريال توفير</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-3xl font-bold">89</p>
              <p className="text-sm text-white/80">صفقة مكتملة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
