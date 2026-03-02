'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  FileText,
  Send,
  Info,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { createBankTransfer, getUserTransfers, type BankTransfer } from '@/lib/actions/bank-transfers';
import { createClient } from '@/lib/supabase/client';

const BANK_INFO = {
  bankName: 'البنك الأهلي السعودي (SNB)',
  iban: 'SA8410000001400035419004',
  accountNumber: '01400035419004',
  swiftCode: 'NCBKSAJE',
  beneficiary: 'منصة تآزر الصناعية',
};
const statusLabels: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'معتمد',
  rejected: 'مرفوض',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

const statusColors: Record<string, 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

export default function BankTransferPage() {
  const [transfers, setTransfers] = React.useState<BankTransfer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const hasPendingTransfer = transfers.some(t => t.status === 'pending');

  React.useEffect(() => {
    loadTransfers();
  }, []);

  async function loadTransfers() {
    const data = await getUserTransfers();
    setTransfers(data);
    setLoading(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setFormError('يرجى رفع صورة أو ملف PDF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('حجم الملف يجب أن يكون أقل من 5 ميغابايت');
      return;
    }

    setReceiptFile(file);
    setFormError(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  }

  async function copyToClipboard(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const senderName = formData.get('senderName') as string;
    const referenceNumber = formData.get('referenceNumber') as string;
    const transferDate = formData.get('transferDate') as string;
    const amountStr = formData.get('amount') as string;
    const amount = parseFloat(amountStr);

    if (!amount || amount <= 0) {
      setFormError('يرجى إدخال مبلغ صحيح');
      setSubmitting(false);
      return;
    }

    if (!receiptFile) {
      setFormError('يرجى رفع صورة الإيصال');
      setSubmitting(false);
      return;
    }

    try {
      setUploadProgress(true);
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFormError('يجب تسجيل الدخول أولاً');
        setSubmitting(false);
        return;
      }

      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('bank-receipts')
        .upload(fileName, receiptFile);

      if (uploadError) {
        setFormError('حدث خطأ أثناء رفع الإيصال. يرجى المحاولة مرة أخرى');
        setSubmitting(false);
        setUploadProgress(false);
        return;
      }

      setUploadProgress(false);

      const result = await createBankTransfer({
        amount,
        senderName,
        referenceNumber,
        transferDate,
        receiptPath: fileName,
      });

      if (result.success) {
        setSuccess(true);
        loadTransfers();
      } else {
        setFormError(result.error || 'حدث خطأ غير متوقع');
      }
    } catch {
      setFormError('حدث خطأ أثناء إرسال الطلب');
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted text-foreground mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold mb-4">تم استلام طلبك</h1>
          <p className="text-muted-foreground mb-2">
            سيتم مراجعة طلب التحويل البنكي خلال 24 ساعة
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            سيتم إشعارك عند اعتماد أو رفض الطلب
          </p>
          <Button onClick={() => setSuccess(false)} variant="outline" className="w-full max-w-xs">
            العودة لصفحة التحويل
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">التحويل البنكي</h1>
        <p className="text-muted-foreground mt-1">
          قم بالتحويل على الحساب أدناه ثم ارفع إيصال التحويل للمراجعة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-muted to-accent dark:from-muted dark:to-accent border border-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold">بيانات الحساب البنكي</h2>
            </div>

            <div className="space-y-4">
              <InfoRow
                label="اسم البنك"
                value={BANK_INFO.bankName}
                onCopy={() => copyToClipboard(BANK_INFO.bankName, 'bank')}
                copied={copied === 'bank'}
              />
              <InfoRow
                label="رقم الآيبان (IBAN)"
                value={BANK_INFO.iban}
                onCopy={() => copyToClipboard(BANK_INFO.iban, 'iban')}
                copied={copied === 'iban'}
                dir="ltr"
              />
              <InfoRow
                label="اسم المستفيد"
                value={BANK_INFO.beneficiary}
                onCopy={() => copyToClipboard(BANK_INFO.beneficiary, 'name')}
                copied={copied === 'name'}
              />
              <InfoRow
                label="المستفيد"
                value={BANK_INFO.beneficiary}
                onCopy={() => copyToClipboard(BANK_INFO.beneficiary, 'beneficiary')}
                copied={copied === 'beneficiary'}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3"
          >
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">تنبيه مهم</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                لن يتم تفعيل حسابك إلا بعد مراجعة واعتماد التحويل من قبل الإدارة.
                قد تستغرق المراجعة حتى 24 ساعة عمل.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {hasPendingTransfer ? (
            <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border text-center">
              <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">طلب قيد المراجعة</h3>
              <p className="text-muted-foreground text-sm">
                لديك طلب تحويل بنكي قيد المراجعة حالياً. يرجى الانتظار حتى تتم مراجعته قبل إرسال طلب جديد.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold">رفع إيصال التحويل</h2>
              </div>

              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">مبلغ التحويل (ريال)</label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="أدخل المبلغ المحول"
                    required
                    min="1"
                    step="0.01"
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background backdrop-blur-sm focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 transition-all text-sm"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم المحول</label>
                  <input
                    type="text"
                    name="senderName"
                    placeholder="الاسم كما يظهر في الحوالة"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background backdrop-blur-sm focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم العملية / رقم المرجع</label>
                  <input
                    type="text"
                    name="referenceNumber"
                    placeholder="رقم المرجع من البنك"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background backdrop-blur-sm focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 transition-all text-sm"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">تاريخ التحويل</label>
                  <input
                    type="date"
                    name="transferDate"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background backdrop-blur-sm focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">صورة الإيصال</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-foreground/50 hover:bg-muted/50 transition-all"
                  >
                    {receiptPreview ? (
                      <div className="space-y-3">
                        <img
                          src={receiptPreview}
                          alt="معاينة الإيصال"
                          className="max-h-40 mx-auto rounded-lg object-contain"
                        />
                        <p className="text-sm text-foreground font-medium">
                          {receiptFile?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">انقر لتغيير الصورة</p>
                      </div>
                    ) : receiptFile ? (
                      <div className="space-y-2">
                        <FileText className="h-10 w-10 text-foreground mx-auto" />
                        <p className="text-sm text-foreground font-medium">{receiptFile.name}</p>
                        <p className="text-xs text-muted-foreground">انقر لتغيير الملف</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          انقر لرفع صورة الإيصال
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, أو PDF - حد أقصى 5 ميغابايت
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={submitting || !receiptFile}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      {uploadProgress ? 'جاري رفع الإيصال...' : 'جاري الإرسال...'}
                    </>
                  ) : (
                    <>
                      <Send className="ml-2 h-5 w-5" />
                      إرسال طلب التحويل
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </motion.div>
      </div>

      {transfers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold">سجل التحويلات</h2>
          <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right text-sm font-medium text-muted-foreground p-4">التاريخ</th>
                    <th className="text-right text-sm font-medium text-muted-foreground p-4">المبلغ</th>
                    <th className="text-right text-sm font-medium text-muted-foreground p-4">رقم المرجع</th>
                    <th className="text-right text-sm font-medium text-muted-foreground p-4">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="border-b border-border/50 last:border-0">
                      <td className="p-4 text-sm">
                        {new Date(transfer.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {transfer.amount.toLocaleString('ar-SA')} ريال
                      </td>
                      <td className="p-4 text-sm font-mono" dir="ltr">
                        {transfer.reference_number}
                      </td>
                      <td className="p-4">
                        <Badge variant={statusColors[transfer.status]}>
                          <span className="flex items-center gap-1.5">
                            {statusIcons[transfer.status]}
                            {statusLabels[transfer.status]}
                          </span>
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  onCopy,
  copied,
  dir,
  highlight,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  dir?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-card/60 dark:bg-card/60">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p
          className={`text-sm font-semibold truncate ${highlight ? 'text-foreground text-lg' : ''}`}
          dir={dir}
        >
          {value}
        </p>
      </div>
      <button
        onClick={onCopy}
        className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
        title="نسخ"
      >
        {copied ? (
          <CheckCircle className="h-4 w-4 text-foreground" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
