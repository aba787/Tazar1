'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Factory, AlertCircle, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { verifyOtp, sendOtp } from '@/lib/actions/auth';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const redirect = searchParams.get('redirect') || '/overview';
  const fullName = searchParams.get('fullName') || '';
  const phone = searchParams.get('phone') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const isVerifyingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setFormError('يرجى إدخال الكود المكون من 6 أرقام');
      return;
    }

    setIsLoading(true);
    setFormError(null);

    const result = await verifyOtp(email, code);

    if (result.success) {
      router.push(result.isAdmin ? '/admin' : redirect);
      router.refresh();
    } else {
      setFormError(result.error || 'الكود غير صحيح');
      setIsLoading(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setFormError(null);

    const metadata = fullName && phone ? { fullName, phone } : undefined;
    const result = await sendOtp(email, metadata);

    if (result.success) {
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setFormError(result.error || 'حدث خطأ أثناء إعادة الإرسال');
    }
    setIsResending(false);
  };

  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && !isVerifyingRef.current) {
      isVerifyingRef.current = true;
      handleVerify().finally(() => {
        isVerifyingRef.current = false;
      });
    }
  }, [otp]);

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">أدخل كود التحقق</h1>
          <p className="text-muted-foreground mt-2">
            تم إرسال كود مكون من 6 أرقام إلى
          </p>
          <p className="font-medium text-foreground mt-1 dir-ltr" dir="ltr">{email}</p>
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

        <div className="flex justify-center gap-3 mb-8" dir="ltr">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading}
              className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          className="w-full h-12 text-base mb-4"
          disabled={isLoading || otp.join('').length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جاري التحقق...
            </>
          ) : (
            <>
              <ShieldCheck className="ml-2 h-5 w-5" />
              تحقق
            </>
          )}
        </Button>

        <div className="text-center space-y-3">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isResending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {resendCooldown > 0
              ? `إعادة الإرسال بعد ${resendCooldown} ثانية`
              : 'إعادة إرسال الكود'
            }
          </button>

          <button
            onClick={() => router.push('/login')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
          >
            <ArrowRight className="h-4 w-4" />
            تغيير البريد الإلكتروني
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    }>
      <VerifyOtpForm />
    </Suspense>
  );
}
