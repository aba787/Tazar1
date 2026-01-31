'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  Clock,
  Briefcase,
  Timer,
  ChevronLeft,
  ChevronRight,
  Upload,
  Calendar,
  User,
  Truck,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button, Badge, Input } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';
import type { EquipmentCapability, ContractType, ShiftPreference, RFQRequest } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface RFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentCapability;
}

interface RFQFormData {
  jobType: ContractType | null;
  quantity: string;
  unitType: string;
  shiftsNeeded: string;
  preferredShifts: ShiftPreference[];
  projectScope: string;
  estimatedDuration: string;
  material: string;
  dimensions: string;
  toleranceRequired: string;
  jobDescription: string;
  additionalNotes: string;
  preferredStartDate: string;
  deadline: string;
  needsOperator: boolean;
  deliveryRequired: boolean;
  deliveryAddress: string;
  agreeToShare: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const contractTypeOptions = [
  {
    type: 'unit' as ContractType,
    icon: Package,
    title: 'بالقطعة',
    description: 'أحتاج كمية محددة',
  },
  {
    type: 'shift' as ContractType,
    icon: Clock,
    title: 'بالوردية',
    description: 'أحتاج وقت تشغيل',
  },
  {
    type: 'project' as ContractType,
    icon: Briefcase,
    title: 'بالمشروع',
    description: 'مشروع كامل متكامل',
  },
  {
    type: 'hourly' as ContractType,
    icon: Timer,
    title: 'بالساعة',
    description: 'استخدام مرن',
  },
];

const shiftOptions: { value: ShiftPreference; label: string; time: string }[] = [
  { value: 'morning', label: 'صباحي', time: '6ص - 2م' },
  { value: 'evening', label: 'مسائي', time: '2م - 10م' },
  { value: 'night', label: 'ليلي', time: '10م - 6ص' },
];

const toleranceOptions = ['±0.01 mm', '±0.05 mm', '±0.1 mm', '±0.5 mm', '±1 mm', 'غير محدد'];

const initialFormData: RFQFormData = {
  jobType: null,
  quantity: '',
  unitType: 'قطعة',
  shiftsNeeded: '',
  preferredShifts: [],
  projectScope: '',
  estimatedDuration: '',
  material: '',
  dimensions: '',
  toleranceRequired: '',
  jobDescription: '',
  additionalNotes: '',
  preferredStartDate: '',
  deadline: '',
  needsOperator: false,
  deliveryRequired: false,
  deliveryAddress: '',
  agreeToShare: false,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function RFQModal({ isOpen, onClose, equipment }: RFQModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RFQFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rfqNumber, setRfqNumber] = useState('');

  const totalSteps = 5;

  const updateFormData = <K extends keyof RFQFormData>(key: K, value: RFQFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRfqNumber(`RFQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setStep(1);
    setFormData(initialFormData);
    setIsSuccess(false);
    setRfqNumber('');
    onClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.jobType !== null;
      case 2:
        if (formData.jobType === 'unit') {
          return formData.quantity !== '' && formData.material !== '';
        }
        if (formData.jobType === 'shift') {
          return formData.shiftsNeeded !== '' && formData.preferredShifts.length > 0;
        }
        if (formData.jobType === 'project') {
          return formData.projectScope !== '';
        }
        return formData.jobDescription !== '';
      case 3:
        return true; // Attachments are optional
      case 4:
        return formData.preferredStartDate !== '' && formData.deadline !== '';
      case 5:
        return formData.agreeToShare;
      default:
        return false;
    }
  };

  const getEstimatedPrice = () => {
    const pricing = equipment.pricing.find((p) => p.type === formData.jobType);
    if (!pricing) return null;

    let min = 0;
    let max = 0;

    if (formData.jobType === 'unit' && pricing.unitRate && formData.quantity) {
      const qty = parseInt(formData.quantity) || 0;
      min = pricing.unitRate * qty * 0.9;
      max = pricing.unitRate * qty * 1.1;
    } else if (formData.jobType === 'shift' && pricing.shiftRate && formData.shiftsNeeded) {
      const shifts = parseInt(formData.shiftsNeeded) || 0;
      min = pricing.shiftRate * shifts * 0.9;
      max = pricing.shiftRate * shifts * 1.1;
    } else if (formData.jobType === 'hourly' && pricing.hourlyRate) {
      min = pricing.hourlyRate * 8 * 0.9;
      max = pricing.hourlyRate * 8 * 1.1;
    } else if (formData.jobType === 'project' && pricing.projectMinimum) {
      min = pricing.projectMinimum;
      max = pricing.projectMinimum * 2;
    }

    if (formData.needsOperator && equipment.operator.operatorRate) {
      const operatorCost = equipment.operator.operatorRate * (parseInt(formData.shiftsNeeded) || 1);
      min += operatorCost;
      max += operatorCost;
    }

    return { min, max };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-md p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <div>
              <h2 className="text-xl font-bold text-foreground">طلب عرض سعر</h2>
              <p className="text-sm text-muted-foreground">{equipment.name}</p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          {!isSuccess && (
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all',
                      s === step
                        ? 'bg-emerald-500 text-white'
                        : s < step
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                    )}
                  >
                    {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                  </div>
                ))}
              </div>
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-8"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    تم إرسال طلب عرض السعر بنجاح
                  </h3>
                  <p className="text-muted-foreground mb-4">رقم الطلب: {rfqNumber}</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    سيتواصل معك المورد خلال 24-48 ساعة
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={handleClose}>
                      إغلاق
                    </Button>
                    <Button>تتبع الطلب</Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Step 1: Contract Type */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground mb-4">اختر نوع التعاقد</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {contractTypeOptions.map((option) => (
                          <button
                            key={option.type}
                            onClick={() => updateFormData('jobType', option.type)}
                            className={cn(
                              'p-6 rounded-xl border-2 text-center transition-all',
                              formData.jobType === option.type
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            )}
                          >
                            <option.icon
                              className={cn(
                                'h-8 w-8 mx-auto mb-3',
                                formData.jobType === option.type
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-gray-400'
                              )}
                            />
                            <p className="font-semibold text-foreground">{option.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Job Details */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground">تفاصيل العمل</h3>

                      {formData.jobType === 'unit' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                الكمية المطلوبة *
                              </label>
                              <Input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => updateFormData('quantity', e.target.value)}
                                placeholder="500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                وحدة القياس *
                              </label>
                              <select
                                value={formData.unitType}
                                onChange={(e) => updateFormData('unitType', e.target.value)}
                                className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                              >
                                <option>قطعة</option>
                                <option>كيلوغرام</option>
                                <option>متر</option>
                                <option>لتر</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              نوع الخامة *
                            </label>
                            <Input
                              value={formData.material}
                              onChange={(e) => updateFormData('material', e.target.value)}
                              placeholder="ألمنيوم 6061-T6"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              الأبعاد المطلوبة
                            </label>
                            <Input
                              value={formData.dimensions}
                              onChange={(e) => updateFormData('dimensions', e.target.value)}
                              placeholder="150 x 80 x 25 mm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              دقة التفاوت (Tolerance)
                            </label>
                            <select
                              value={formData.toleranceRequired}
                              onChange={(e) => updateFormData('toleranceRequired', e.target.value)}
                              className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                            >
                              <option value="">اختر...</option>
                              {toleranceOptions.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      {formData.jobType === 'shift' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              عدد الورديات المطلوبة *
                            </label>
                            <Input
                              type="number"
                              value={formData.shiftsNeeded}
                              onChange={(e) => updateFormData('shiftsNeeded', e.target.value)}
                              placeholder="5"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              الورديات المفضلة *
                            </label>
                            <div className="space-y-2">
                              {shiftOptions.map((shift) => (
                                <label
                                  key={shift.value}
                                  className={cn(
                                    'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                                    formData.preferredShifts.includes(shift.value)
                                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                                      : 'border-gray-200 dark:border-gray-700',
                                    !equipment.availability.shifts[shift.value] && 'opacity-50 cursor-not-allowed'
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={formData.preferredShifts.includes(shift.value)}
                                      disabled={!equipment.availability.shifts[shift.value]}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          updateFormData('preferredShifts', [
                                            ...formData.preferredShifts,
                                            shift.value,
                                          ]);
                                        } else {
                                          updateFormData(
                                            'preferredShifts',
                                            formData.preferredShifts.filter((s) => s !== shift.value)
                                          );
                                        }
                                      }}
                                      className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <span className="font-medium">{shift.label}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{shift.time}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              وصف العمل المطلوب *
                            </label>
                            <textarea
                              value={formData.jobDescription}
                              onChange={(e) => updateFormData('jobDescription', e.target.value)}
                              placeholder="تشغيل قطع ألمنيوم حسب المخططات المرفقة..."
                              className="w-full min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                            />
                          </div>
                        </>
                      )}

                      {formData.jobType === 'project' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              نطاق المشروع *
                            </label>
                            <textarea
                              value={formData.projectScope}
                              onChange={(e) => updateFormData('projectScope', e.target.value)}
                              placeholder="وصف تفصيلي للمشروع والمتطلبات..."
                              className="w-full min-h-32 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              المدة المتوقعة
                            </label>
                            <Input
                              value={formData.estimatedDuration}
                              onChange={(e) => updateFormData('estimatedDuration', e.target.value)}
                              placeholder="أسبوعين"
                            />
                          </div>
                        </>
                      )}

                      {formData.jobType === 'hourly' && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            وصف العمل المطلوب *
                          </label>
                          <textarea
                            value={formData.jobDescription}
                            onChange={(e) => updateFormData('jobDescription', e.target.value)}
                            placeholder="صف العمل المطلوب بالتفصيل..."
                            className="w-full min-h-32 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Attachments */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground">المرفقات التقنية</h3>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          المخططات الهندسية (اختياري)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
                          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                          <p className="text-sm text-muted-foreground">
                            اسحب الملفات هنا أو اضغط للرفع
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, DWG, DXF, STEP (حد أقصى 10MB)
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          صور العينة/المنتج النهائي (اختياري)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
                          <FileText className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                          <p className="text-sm text-muted-foreground">
                            اسحب الصور هنا أو اضغط للرفع
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG (حد أقصى 5MB لكل صورة)
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          ملاحظات تقنية إضافية
                        </label>
                        <textarea
                          value={formData.additionalNotes}
                          onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                          placeholder="أي ملاحظات أو متطلبات إضافية..."
                          className="w-full min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Timeline & Operator */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground">الجدول الزمني والخدمات</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            <Calendar className="inline h-4 w-4 ml-1" />
                            تاريخ البدء المفضل *
                          </label>
                          <Input
                            type="date"
                            value={formData.preferredStartDate}
                            onChange={(e) => updateFormData('preferredStartDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            <Calendar className="inline h-4 w-4 ml-1" />
                            الموعد النهائي للتسليم *
                          </label>
                          <Input
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => updateFormData('deadline', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <label className="block text-sm font-medium text-foreground mb-3">
                          <User className="inline h-4 w-4 ml-1" />
                          هل تحتاج مشغل للمعدة؟
                        </label>
                        <div className="space-y-2">
                          <label
                            className={cn(
                              'flex items-center p-4 rounded-lg border cursor-pointer transition-all',
                              formData.needsOperator
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                                : 'border-gray-200 dark:border-gray-700'
                            )}
                          >
                            <input
                              type="radio"
                              checked={formData.needsOperator}
                              onChange={() => updateFormData('needsOperator', true)}
                              className="h-4 w-4 ml-3"
                            />
                            <div>
                              <span className="font-medium">نعم، أحتاج مشغل</span>
                              {equipment.operator.operatorRate && (
                                <span className="text-sm text-muted-foreground mr-2">
                                  (+{formatCurrency(equipment.operator.operatorRate)}/وردية)
                                </span>
                              )}
                            </div>
                          </label>
                          <label
                            className={cn(
                              'flex items-center p-4 rounded-lg border cursor-pointer transition-all',
                              !formData.needsOperator
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                                : 'border-gray-200 dark:border-gray-700'
                            )}
                          >
                            <input
                              type="radio"
                              checked={!formData.needsOperator}
                              onChange={() => updateFormData('needsOperator', false)}
                              className="h-4 w-4 ml-3"
                            />
                            <span className="font-medium">لا، لدي مشغل معتمد</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.deliveryRequired}
                            onChange={(e) => updateFormData('deliveryRequired', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">نعم، أحتاج نقل القطع لموقعي</span>
                        </label>
                        {formData.deliveryRequired && (
                          <div className="mt-3 mr-7">
                            <Input
                              value={formData.deliveryAddress}
                              onChange={(e) => updateFormData('deliveryAddress', e.target.value)}
                              placeholder="عنوان التسليم"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Review */}
                  {step === 5 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground">مراجعة الطلب</h3>

                      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">المعدة:</span>
                          <span className="font-medium">{equipment.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">المورد:</span>
                          <span className="font-medium">{equipment.ownerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">نوع التعاقد:</span>
                          <Badge variant="secondary">
                            {contractTypeOptions.find((c) => c.type === formData.jobType)?.title}
                          </Badge>
                        </div>
                        {formData.jobType === 'unit' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">الكمية:</span>
                              <span className="font-medium font-numbers">
                                {formData.quantity} {formData.unitType}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">الخامة:</span>
                              <span className="font-medium">{formData.material}</span>
                            </div>
                          </>
                        )}
                        {formData.jobType === 'shift' && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">الورديات:</span>
                            <span className="font-medium font-numbers">{formData.shiftsNeeded} وردية</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">المشغل:</span>
                          <span className="font-medium">
                            {formData.needsOperator ? 'مطلوب' : 'غير مطلوب'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">التسليم:</span>
                          <span className="font-medium">{formData.deadline}</span>
                        </div>
                      </div>

                      {getEstimatedPrice() && (
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 p-4 text-center">
                          <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">
                            السعر التقديري*
                          </p>
                          <p className="text-2xl font-bold font-numbers text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(getEstimatedPrice()!.min)} - {formatCurrency(getEstimatedPrice()!.max)}
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                            * السعر النهائي يحدده المورد
                          </p>
                        </div>
                      )}

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreeToShare}
                          onChange={(e) => updateFormData('agreeToShare', e.target.checked)}
                          className="h-4 w-4 mt-1 rounded border-gray-300"
                        />
                        <span className="text-sm text-muted-foreground">
                          أوافق على مشاركة بياناتي مع المورد لمعالجة هذا الطلب
                        </span>
                      </label>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>سيتم الرد خلال 24-48 ساعة عمل</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {!isSuccess && (
            <div className="sticky bottom-0 flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
                <ChevronRight className="ml-2 h-4 w-4" />
                السابق
              </Button>

              {step < totalSteps ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  التالي
                  <ChevronLeft className="mr-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      جاري الإرسال...
                    </>
                  ) : (
                    'إرسال طلب عرض السعر'
                  )}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
