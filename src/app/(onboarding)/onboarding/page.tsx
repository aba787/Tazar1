'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Factory,
  MapPin,
  Cog,
  FileText,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  Phone,
  Mail,
  Globe,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui';
import {
  getOnboardingStatus,
  getFactoryOnboardingData,
  saveBasicInfo,
  saveLocationInfo,
  saveCapabilities,
  saveDocuments,
  submitForVerification,
  uploadDocument,
} from '@/lib/actions/onboarding';
import {
  DOCUMENT_TYPE_LABELS,
  INDUSTRY_LABELS,
  SAUDI_CITIES,
  type DocumentType,
  type IndustryType,
} from '@/types';

const STEPS = [
  { id: 1, title: 'بيانات المصنع', icon: Building2 },
  { id: 2, title: 'الموقع والتواصل', icon: MapPin },
  { id: 3, title: 'القدرات الإنتاجية', icon: Cog },
  { id: 4, title: 'الوثائق الرسمية', icon: FileText },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1
    factoryName: '',
    factoryNameEn: '',
    commercialRegisterNumber: '',
    vatNumber: '',
    establishedYear: '',
    employeeCount: '',

    // Step 2
    city: '',
    district: '',
    street: '',
    postalCode: '',
    contactPhone: '',
    contactEmail: '',
    website: '',

    // Step 3
    categories: [] as IndustryType[],
    description: '',

    // Step 4
    documents: [] as {
      documentType: string;
      fileUrl: string;
      fileName: string;
      fileSize: number;
      fileType: string;
    }[],
  });

  useEffect(() => {
    loadOnboardingData();
  }, []);

  async function loadOnboardingData() {
    setIsLoading(true);

    const status = await getOnboardingStatus();

    if (status.status === 'no_user') {
      router.push('/login');
      return;
    }

    if (status.status === 'verified') {
      router.push('/overview');
      return;
    }

    if (status.status === 'submitted') {
      setOnboardingStatus('submitted');
      setIsLoading(false);
      return;
    }

    if (status.status !== 'no_factory') {
      setCurrentStep(status.step || 1);

      // Load existing data
      const factory = await getFactoryOnboardingData();
      if (factory) {
        setFormData({
          factoryName: factory.name || '',
          factoryNameEn: factory.name_en || '',
          commercialRegisterNumber: factory.commercial_registration || '',
          vatNumber: factory.vat_number || '',
          establishedYear: factory.established_year?.toString() || '',
          employeeCount: factory.employee_count?.toString() || '',
          city: factory.city || '',
          district: factory.district || '',
          street: factory.address || '',
          postalCode: factory.postal_code || '',
          contactPhone: factory.contact_phone || factory.phone || '',
          contactEmail: factory.contact_email || factory.email || '',
          website: factory.website || '',
          categories: factory.capabilities?.map((c: { category: IndustryType }) => c.category) || [],
          description: factory.description || '',
          documents:
            factory.documents?.map((d: { document_type: string; file_url: string; file_name: string; file_size: number; file_type: string }) => ({
              documentType: d.document_type,
              fileUrl: d.file_url,
              fileName: d.file_name,
              fileSize: d.file_size,
              fileType: d.file_type,
            })) || [],
        });
      }
    }

    setIsLoading(false);
  }

  async function handleNext() {
    setIsSaving(true);
    setError(null);

    try {
      let result;

      switch (currentStep) {
        case 1:
          if (!formData.factoryName.trim()) {
            setError('اسم المصنع مطلوب');
            setIsSaving(false);
            return;
          }
          if (!formData.commercialRegisterNumber.trim()) {
            setError('رقم السجل التجاري مطلوب');
            setIsSaving(false);
            return;
          }
          result = await saveBasicInfo({
            factoryName: formData.factoryName,
            factoryNameEn: formData.factoryNameEn || undefined,
            commercialRegisterNumber: formData.commercialRegisterNumber,
            vatNumber: formData.vatNumber || undefined,
            establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined,
            employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
          });
          break;

        case 2:
          if (!formData.city) {
            setError('المدينة مطلوبة');
            setIsSaving(false);
            return;
          }
          if (!formData.district.trim()) {
            setError('الحي / المنطقة الصناعية مطلوب');
            setIsSaving(false);
            return;
          }
          if (!formData.street.trim()) {
            setError('العنوان التفصيلي مطلوب');
            setIsSaving(false);
            return;
          }
          if (!formData.contactPhone.trim()) {
            setError('رقم الجوال مطلوب');
            setIsSaving(false);
            return;
          }
          if (!formData.contactEmail.trim()) {
            setError('البريد الإلكتروني مطلوب');
            setIsSaving(false);
            return;
          }
          result = await saveLocationInfo({
            city: formData.city,
            district: formData.district,
            street: formData.street,
            postalCode: formData.postalCode || undefined,
            contactPhone: formData.contactPhone,
            contactEmail: formData.contactEmail,
            website: formData.website || undefined,
          });
          break;

        case 3:
          if (formData.categories.length === 0) {
            setError('يرجى اختيار مجال تصنيع واحد على الأقل');
            setIsSaving(false);
            return;
          }
          if (!formData.description.trim()) {
            setError('وصف المصنع مطلوب');
            setIsSaving(false);
            return;
          }
          result = await saveCapabilities({
            categories: formData.categories,
            description: formData.description,
            capabilities: formData.categories.map((cat) => ({ category: cat })),
          });
          break;

        case 4:
          if (!formData.documents.some((d) => d.documentType === 'commercial_register')) {
            setError('السجل التجاري مطلوب');
            setIsSaving(false);
            return;
          }
          result = await saveDocuments(formData.documents);
          if (result.success) {
            // Submit for verification
            const submitResult = await submitForVerification();
            if (submitResult.success) {
              setOnboardingStatus('submitted');
            } else {
              setError(submitResult.error || 'حدث خطأ');
            }
          }
          break;
      }

      if (result && !result.success) {
        setError(result.error || 'حدث خطأ');
      } else if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } catch {
      setError('حدث خطأ غير متوقع');
    }

    setIsSaving(false);
  }

  async function handleFileUpload(documentType: DocumentType, file: File) {
    setError(null);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    const result = await uploadDocument(formDataUpload);

    if (result.success && result.url) {
      setFormData((prev) => ({
        ...prev,
        documents: [
          ...prev.documents.filter((d) => d.documentType !== documentType),
          {
            documentType,
            fileUrl: result.url!,
            fileName: result.fileName!,
            fileSize: result.fileSize!,
            fileType: result.fileType!,
          },
        ],
      }));
    } else {
      setError(result.error || 'فشل رفع الملف');
    }
  }

  function removeDocument(documentType: DocumentType) {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.documentType !== documentType),
    }));
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Submitted state - waiting for verification
  if (onboardingStatus === 'submitted') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 mb-6">
              <Clock className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold mb-4">جاري مراجعة طلبك</h1>
            <p className="text-muted-foreground mb-6">
              تم استلام طلب تسجيل مصنعك بنجاح. فريقنا يقوم بمراجعة المستندات والبيانات المقدمة. سيتم
              إشعارك عبر البريد الإلكتروني خلال 24-48 ساعة عمل.
            </p>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-6">
              <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">في انتظار التحقق</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm text-muted-foreground">البيانات الأساسية</span>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm text-muted-foreground">الموقع والتواصل</span>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm text-muted-foreground">القدرات الإنتاجية</span>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm text-muted-foreground">الوثائق الرسمية</span>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              لديك استفسار؟ تواصل معنا على{' '}
              <a href="mailto:support@takamul.sa" className="text-primary hover:underline">
                support@takamul.sa
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-black to-[#575757] flex items-center justify-center text-white">
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold">تسجيل مصنعك</h1>
                <p className="text-sm text-muted-foreground">أكمل البيانات للانضمام للمنصة</p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-muted text-foreground text-sm font-medium">
              الخطوة {currentStep} من 4
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all
                ${
                  currentStep === step.id
                    ? 'bg-muted text-foreground'
                    : currentStep > step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground'
                }
              `}
              >
                {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button onClick={() => setError(null)} className="mr-auto">
                <X className="h-4 w-4 text-red-600" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold mb-2">بيانات المصنع الأساسية</h2>
                  <p className="text-muted-foreground">أدخل المعلومات الرسمية لمصنعك</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      اسم المصنع (بالعربية) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.factoryName}
                      onChange={(e) => setFormData({ ...formData, factoryName: e.target.value })}
                      placeholder="مثال: مصنع النور للألمنيوم"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">اسم المصنع (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={formData.factoryNameEn}
                      onChange={(e) => setFormData({ ...formData, factoryNameEn: e.target.value })}
                      placeholder="Example: Al Noor Aluminum Factory"
                      dir="ltr"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      رقم السجل التجاري <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.commercialRegisterNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commercialRegisterNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                        })
                      }
                      placeholder="1234567890"
                      maxLength={10}
                      dir="ltr"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-muted-foreground mt-1">10 أرقام</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الرقم الضريبي (VAT)</label>
                    <input
                      type="text"
                      value={formData.vatNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vatNumber: e.target.value.replace(/\D/g, '').slice(0, 15),
                        })
                      }
                      placeholder="300000000000003"
                      maxLength={15}
                      dir="ltr"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">سنة التأسيس</label>
                    <input
                      type="number"
                      value={formData.establishedYear}
                      onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                      placeholder="2015"
                      min="1950"
                      max={new Date().getFullYear()}
                      dir="ltr"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">عدد الموظفين</label>
                    <select
                      value={formData.employeeCount}
                      onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">اختر...</option>
                      <option value="10">1-10</option>
                      <option value="25">11-25</option>
                      <option value="50">26-50</option>
                      <option value="100">51-100</option>
                      <option value="250">101-250</option>
                      <option value="500">251-500</option>
                      <option value="1000">500+</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold mb-2">الموقع ومعلومات التواصل</h2>
                  <p className="text-muted-foreground">أدخل عنوان المصنع وطرق التواصل</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      المدينة <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">اختر المدينة...</option>
                      {SAUDI_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      الحي / المنطقة الصناعية <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="المنطقة الصناعية الثانية"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      العنوان التفصيلي <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="شارع الملك فهد، مبنى رقم 15"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الرمز البريدي</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          postalCode: e.target.value.replace(/\D/g, '').slice(0, 5),
                        })
                      }
                      placeholder="12345"
                      maxLength={5}
                      dir="ltr"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      رقم الجوال <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPhone: e.target.value.replace(/\D/g, '').slice(0, 10),
                          })
                        }
                        placeholder="05XXXXXXXX"
                        dir="ltr"
                        className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      البريد الإلكتروني <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="info@factory.com"
                        dir="ltr"
                        className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الموقع الإلكتروني</label>
                    <div className="relative">
                      <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://www.factory.com"
                        dir="ltr"
                        className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Capabilities */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold mb-2">القدرات الإنتاجية</h2>
                  <p className="text-muted-foreground">حدد مجالات التصنيع والقدرات المتاحة</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    مجالات التصنيع <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(Object.keys(INDUSTRY_LABELS) as IndustryType[]).map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            categories: prev.categories.includes(category)
                              ? prev.categories.filter((c) => c !== category)
                              : [...prev.categories, category],
                          }));
                        }}
                        className={`
                          p-4 rounded-xl border-2 text-right transition-all
                          ${
                            formData.categories.includes(category)
                              ? 'border-primary bg-muted'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                          }
                        `}
                      >
                        <span className="text-sm font-medium">{INDUSTRY_LABELS[category]}</span>
                        {formData.categories.includes(category) && (
                          <Check className="inline-block mr-2 h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    وصف المصنع والقدرات <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="اكتب وصفاً مختصراً عن مصنعك، المنتجات الرئيسية، والقدرات الإنتاجية..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/500 حرف</p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Documents */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold mb-2">الوثائق الرسمية</h2>
                  <p className="text-muted-foreground">ارفع المستندات المطلوبة للتحقق من مصنعك</p>
                </div>

                <div className="space-y-4">
                  {/* Commercial Register - Required */}
                  <DocumentUploadCard
                    type="commercial_register"
                    label={DOCUMENT_TYPE_LABELS.commercial_register}
                    required
                    document={formData.documents.find((d) => d.documentType === 'commercial_register')}
                    onUpload={(file) => handleFileUpload('commercial_register', file)}
                    onRemove={() => removeDocument('commercial_register')}
                  />

                  {/* Industrial License - Optional */}
                  <DocumentUploadCard
                    type="industrial_license"
                    label={DOCUMENT_TYPE_LABELS.industrial_license}
                    document={formData.documents.find((d) => d.documentType === 'industrial_license')}
                    onUpload={(file) => handleFileUpload('industrial_license', file)}
                    onRemove={() => removeDocument('industrial_license')}
                  />

                  {/* VAT Certificate - Optional */}
                  <DocumentUploadCard
                    type="vat_certificate"
                    label={DOCUMENT_TYPE_LABELS.vat_certificate}
                    document={formData.documents.find((d) => d.documentType === 'vat_certificate')}
                    onUpload={(file) => handleFileUpload('vat_certificate', file)}
                    onRemove={() => removeDocument('vat_certificate')}
                  />

                  {/* Chamber Membership - Optional */}
                  <DocumentUploadCard
                    type="chamber_membership"
                    label={DOCUMENT_TYPE_LABELS.chamber_membership}
                    document={formData.documents.find((d) => d.documentType === 'chamber_membership')}
                    onUpload={(file) => handleFileUpload('chamber_membership', file)}
                    onRemove={() => removeDocument('chamber_membership')}
                  />
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">ملاحظات مهمة</p>
                      <ul className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-1 list-disc list-inside space-y-1">
                        <li>السجل التجاري مطلوب (إلزامي)</li>
                        <li>الملفات المدعومة: PDF، JPG، PNG</li>
                        <li>الحد الأقصى لحجم الملف: 5 ميجابايت</li>
                        <li>تأكد من وضوح المستندات وصلاحيتها</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1 || isSaving}
            >
              <ChevronRight className="ml-2 h-4 w-4" />
              السابق
            </Button>

            <Button onClick={handleNext} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : currentStep === 4 ? (
                <>
                  إرسال للمراجعة
                  <Check className="mr-2 h-4 w-4" />
                </>
              ) : (
                <>
                  التالي
                  <ChevronLeft className="mr-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Document Upload Card Component
function DocumentUploadCard({
  type,
  label,
  required = false,
  document,
  onUpload,
  onRemove,
}: {
  type: DocumentType;
  label: string;
  required?: boolean;
  document?: {
    documentType: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  };
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    await onUpload(file);
    setIsUploading(false);

    // Reset input
    e.target.value = '';
  }

  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${document ? 'bg-muted text-primary' : 'bg-gray-100 text-gray-400'}
          `}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">
              {label}
              {required && <span className="text-red-500 mr-1">*</span>}
            </p>
            {document ? (
              <p className="text-sm text-primary">{document.fileName}</p>
            ) : (
              <p className="text-sm text-muted-foreground">PDF أو صورة (حد أقصى 5MB)</p>
            )}
          </div>
        </div>

        {document ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <button
              type="button"
              onClick={onRemove}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <div
              className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${
                isUploading
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-muted text-foreground hover:bg-accent'
              }
            `}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span className="text-sm font-medium">{isUploading ? 'جاري الرفع...' : 'رفع'}</span>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}
