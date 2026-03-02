'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Factory,
  ArrowRight,
  Check,
  X,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  AlertCircle,
  Globe,
  Users,
  Hash,
} from 'lucide-react';
import {
  getFactoryDetails,
  approveFactory,
  rejectFactory,
} from '@/lib/actions/admin';
import { Button, Badge } from '@/components/ui';
import {
  DOCUMENT_TYPE_LABELS,
  FACTORY_CATEGORY_LABELS,
  type IndustryType,
  type DocumentType,
} from '@/types';
import Link from 'next/link';

interface FactoryDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  status: string;
}

interface FactoryCapability {
  id: string;
  category: string;
}

interface FactoryDetails {
  id: string;
  name: string;
  commercial_register: string;
  vat_number?: string;
  established_year?: number;
  employee_count?: number;
  city: string;
  district?: string;
  address?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  onboarding_status: string;
  created_at: string;
  submitted_at?: string;
  verified_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  documents?: FactoryDocument[];
  capabilities?: FactoryCapability[];
}

export default function FactoryDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [factory, setFactory] = useState<FactoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadFactory();
  }, [params.id]);

  async function loadFactory() {
    const data = await getFactoryDetails(params.id);
    setFactory(data);
    setLoading(false);
  }

  async function handleApprove() {
    setActionLoading(true);
    const result = await approveFactory(params.id);
    if (result.success) {
      router.push('/admin/factories?status=submitted');
    } else {
      alert(result.error || 'حدث خطأ');
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    const result = await rejectFactory(params.id, rejectReason);
    if (result.success) {
      router.push('/admin/factories?status=submitted');
    } else {
      alert(result.error || 'حدث خطأ');
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
      </div>
    );
  }

  if (!factory) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">المصنع غير موجود</p>
        <Link
          href="/admin/factories"
          className="mt-4 inline-block text-foreground font-medium hover:underline"
        >
          العودة للقائمة
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/factories"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowRight className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {factory.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">تفاصيل المصنع</p>
          </div>
        </div>

        {factory.onboarding_status === 'submitted' && (
          <div className="flex gap-3">
            <Button
              onClick={() => setShowRejectModal(true)}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              disabled={actionLoading}
            >
              <X className="h-4 w-4 ml-2" />
              رفض
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading}>
              <Check className="h-4 w-4 ml-2" />
              {actionLoading ? 'جاري...' : 'موافقة'}
            </Button>
          </div>
        )}
      </div>

      {/* Status Alert */}
      {factory.onboarding_status === 'submitted' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 dark:text-amber-200">
            هذا المصنع بانتظار الموافقة. يرجى مراجعة البيانات والوثائق قبل اتخاذ
            القرار.
          </p>
        </div>
      )}

      {factory.onboarding_status === 'rejected' && factory.rejection_reason && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-800 dark:text-red-200 font-medium mb-1">
            سبب الرفض:
          </p>
          <p className="text-red-600 dark:text-red-400">
            {factory.rejection_reason}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Building2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              البيانات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={Factory}
                label="اسم المصنع"
                value={factory.name}
              />
              <InfoItem
                icon={Hash}
                label="السجل التجاري"
                value={factory.commercial_register}
              />
              <InfoItem
                icon={Hash}
                label="الرقم الضريبي"
                value={factory.vat_number || '-'}
              />
              <InfoItem
                icon={Calendar}
                label="سنة التأسيس"
                value={factory.established_year?.toString() || '-'}
              />
              <InfoItem
                icon={Users}
                label="عدد الموظفين"
                value={factory.employee_count?.toString() || '-'}
              />
              <InfoItem icon={MapPin} label="المدينة" value={factory.city} />
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Phone className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              معلومات التواصل
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={Users}
                label="اسم المسؤول"
                value={factory.contact_name || '-'}
              />
              <InfoItem
                icon={Phone}
                label="الجوال"
                value={factory.phone || factory.contact_phone || '-'}
              />
              <InfoItem
                icon={Mail}
                label="البريد الإلكتروني"
                value={factory.email || factory.contact_email || '-'}
              />
              <InfoItem
                icon={Globe}
                label="الموقع الإلكتروني"
                value={factory.website || '-'}
              />
              <div className="md:col-span-2">
                <InfoItem
                  icon={MapPin}
                  label="العنوان"
                  value={`${factory.district || ''} ${factory.address ? '- ' + factory.address : ''}`.trim() || '-'}
                />
              </div>
            </div>
          </div>

          {/* Capabilities */}
          {factory.capabilities && factory.capabilities.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                القدرات الإنتاجية
              </h2>
              <div className="flex flex-wrap gap-2">
                {factory.capabilities.map((cap) => (
                  <Badge key={cap.id} variant="secondary">
                    {FACTORY_CATEGORY_LABELS[cap.category as IndustryType] ||
                      cap.category}
                  </Badge>
                ))}
              </div>
              {factory.description && (
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  {factory.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              الوثائق المرفقة
            </h2>

            {!factory.documents || factory.documents.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                لا توجد وثائق
              </p>
            ) : (
              <div className="space-y-3">
                {factory.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {DOCUMENT_TYPE_LABELS[doc.document_type as DocumentType] ||
                            doc.document_type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {doc.file_name}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Calendar className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              التسلسل الزمني
            </h2>

            <div className="space-y-4">
              <TimelineItem label="تاريخ التسجيل" date={factory.created_at} />
              {factory.submitted_at && (
                <TimelineItem
                  label="تاريخ الإرسال للمراجعة"
                  date={factory.submitted_at}
                />
              )}
              {factory.verified_at && (
                <TimelineItem
                  label="تاريخ الموافقة"
                  date={factory.verified_at}
                  success
                />
              )}
              {factory.rejected_at && (
                <TimelineItem
                  label="تاريخ الرفض"
                  date={factory.rejected_at}
                  error
                />
              )}
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              حالة المصنع
            </h2>
            <StatusBadgeLarge status={factory.onboarding_status} />
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              رفض طلب المصنع
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              يرجى كتابة سبب الرفض. سيتم إرساله للمصنع.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="سبب الرفض..."
              rows={4}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? 'جاري...' : 'تأكيد الرفض'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function TimelineItem({
  label,
  date,
  success,
  error,
}: {
  label: string;
  date: string;
  success?: boolean;
  error?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          success
            ? 'bg-green-500'
            : error
              ? 'bg-red-500'
              : 'bg-gray-400'
        }`}
      />
      <div>
        <p className="text-sm text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

function StatusBadgeLarge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    pending: {
      label: 'جديد',
      color: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
    },
    in_progress: {
      label: 'قيد التسجيل',
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    submitted: {
      label: 'بانتظار الموافقة',
      color: 'text-amber-700 dark:text-amber-300',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    verified: {
      label: 'معتمد',
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    rejected: {
      label: 'مرفوض',
      color: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
  };

  const { label, color, bgColor } = config[status] || config.pending;

  return (
    <div className={`rounded-lg p-4 text-center ${bgColor}`}>
      <p className={`text-lg font-bold ${color}`}>{label}</p>
    </div>
  );
}
