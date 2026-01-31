'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type {
  ProcurementDeal,
  PricingTier,
  Incoterm,
  DealParticipation,
} from '@/types';
import { INCOTERM_LABELS } from '@/types';
import {
  X,
  Package,
  Truck,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Upload,
  CreditCard,
  Building2,
  MapPin,
  Calculator,
  Shield,
  AlertCircle,
  Minus,
  Plus,
} from 'lucide-react';

interface JoinDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: ProcurementDeal;
  onSubmit: (data: JoinDealFormData) => Promise<void>;
}

export interface JoinDealFormData {
  quantity: number;
  deliveryPreference: 'individual' | 'consolidated';
  deliveryAddress?: string;
  deliveryIncoterm?: Incoterm;
  commitmentMethod: 'po' | 'escrow';
  poNumber?: string;
  poFile?: File;
  notes?: string;
}

const STEPS = [
  { id: 1, title: 'الكمية', icon: Package },
  { id: 2, title: 'التسليم', icon: Truck },
  { id: 3, title: 'الالتزام', icon: FileText },
  { id: 4, title: 'التأكيد', icon: CheckCircle2 },
];

export function JoinDealModal({ isOpen, onClose, deal, onSubmit }: JoinDealModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<JoinDealFormData>({
    quantity: deal.minQuantity || 10,
    deliveryPreference: 'individual',
    commitmentMethod: 'escrow',
  });

  // Get current tier based on total quantity after joining
  const projectedQuantity = deal.currentQuantity + formData.quantity;

  const currentTier = useMemo(() => {
    const sortedTiers = [...deal.pricingTiers].sort((a, b) => b.tierIndex - a.tierIndex);
    for (const tier of sortedTiers) {
      if (projectedQuantity >= tier.minQuantity &&
          (tier.maxQuantity === null || projectedQuantity <= tier.maxQuantity)) {
        return tier;
      }
    }
    return deal.pricingTiers.find(t => t.tierIndex === 0) || null;
  }, [deal.pricingTiers, projectedQuantity]);

  // Calculate pricing
  const pricePerUnit = currentTier?.pricePerUnit || deal.marketPricePerUnit;
  const totalAmount = pricePerUnit * formData.quantity;
  const escrowAmount = Math.round((totalAmount * deal.escrowPercentage) / 100);
  const savingsPercentage = currentTier?.discountPercentage || 0;
  const savedAmount = (deal.marketPricePerUnit - pricePerUnit) * formData.quantity;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error joining deal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<JoinDealFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden mx-4"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">الانضمام للصفقة</h2>
            <p className="text-sm text-gray-500">{deal.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isCompleted = s.id < step;

              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                        isActive && 'bg-emerald-500 text-white',
                        isCompleted && 'bg-emerald-100 text-emerald-600',
                        !isActive && !isCompleted && 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium hidden sm:block',
                        isActive && 'text-emerald-600',
                        isCompleted && 'text-gray-600',
                        !isActive && !isCompleted && 'text-gray-400'
                      )}
                    >
                      {s.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-4',
                        isCompleted ? 'bg-emerald-300' : 'bg-gray-200'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepQuantity
                key="quantity"
                deal={deal}
                quantity={formData.quantity}
                onQuantityChange={(quantity) => updateFormData({ quantity })}
                currentTier={currentTier}
                pricePerUnit={pricePerUnit}
                totalAmount={totalAmount}
                savingsPercentage={savingsPercentage}
              />
            )}
            {step === 2 && (
              <StepDelivery
                key="delivery"
                formData={formData}
                onUpdate={updateFormData}
              />
            )}
            {step === 3 && (
              <StepCommitment
                key="commitment"
                formData={formData}
                onUpdate={updateFormData}
                escrowAmount={escrowAmount}
                escrowPercentage={deal.escrowPercentage}
              />
            )}
            {step === 4 && (
              <StepReview
                key="review"
                deal={deal}
                formData={formData}
                currentTier={currentTier}
                pricePerUnit={pricePerUnit}
                totalAmount={totalAmount}
                escrowAmount={escrowAmount}
                savedAmount={savedAmount}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>{step === 1 ? 'إلغاء' : 'رجوع'}</span>
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span>جاري الإرسال...</span>
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </>
              ) : (
                <>
                  <span>تأكيد الانضمام</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ========== Step Components ==========

interface StepQuantityProps {
  deal: ProcurementDeal;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  currentTier: PricingTier | null;
  pricePerUnit: number;
  totalAmount: number;
  savingsPercentage: number;
}

function StepQuantity({
  deal,
  quantity,
  onQuantityChange,
  currentTier,
  pricePerUnit,
  totalAmount,
  savingsPercentage,
}: StepQuantityProps) {
  const minQty = deal.minQuantity || 1;
  const maxQty = deal.maxQuantity || 10000;

  const adjustQuantity = (delta: number) => {
    const newQty = Math.max(minQty, Math.min(maxQty, quantity + delta));
    onQuantityChange(newQty);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          الكمية المطلوبة ({deal.unit})
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => adjustQuantity(-10)}
            className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Minus className="w-5 h-5 text-gray-600" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(minQty, Math.min(maxQty, Number(e.target.value) || minQty)))}
            className="flex-1 text-center text-2xl font-bold py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            onClick={() => adjustQuantity(10)}
            className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          الحد الأدنى: {formatNumber(minQty)} {deal.unit} | الحد الأقصى: {formatNumber(maxQty)} {deal.unit}
        </p>
      </div>

      {/* Live Price Calculator */}
      <div className="p-4 rounded-xl bg-gradient-to-l from-emerald-50 to-teal-50 border border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-5 h-5 text-emerald-600" />
          <span className="font-medium text-gray-900">حاسبة السعر المباشر</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-500 mb-1">سعر الوحدة</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(pricePerUnit)}</p>
            <p className="text-xs text-gray-400">/{deal.unit}</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-500 mb-1">الإجمالي</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalAmount)}</p>
            {savingsPercentage > 0 && (
              <p className="text-xs text-emerald-500">توفير {savingsPercentage}%</p>
            )}
          </div>
        </div>

        {/* Current Tier Info */}
        {currentTier && (
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">الشريحة الحالية:</span>
              <span className="font-medium text-emerald-600">{currentTier.tierLabel}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface StepDeliveryProps {
  formData: JoinDealFormData;
  onUpdate: (updates: Partial<JoinDealFormData>) => void;
}

function StepDelivery({ formData, onUpdate }: StepDeliveryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Delivery Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          نوع التسليم
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onUpdate({ deliveryPreference: 'individual' })}
            className={cn(
              'p-4 rounded-xl border-2 text-right transition-all',
              formData.deliveryPreference === 'individual'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <Building2 className={cn(
              'w-6 h-6 mb-2',
              formData.deliveryPreference === 'individual' ? 'text-emerald-600' : 'text-gray-400'
            )} />
            <p className="font-medium text-gray-900">تسليم فردي</p>
            <p className="text-xs text-gray-500 mt-1">التسليم مباشرة لموقع مصنعك</p>
          </button>

          <button
            onClick={() => onUpdate({ deliveryPreference: 'consolidated' })}
            className={cn(
              'p-4 rounded-xl border-2 text-right transition-all',
              formData.deliveryPreference === 'consolidated'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <Package className={cn(
              'w-6 h-6 mb-2',
              formData.deliveryPreference === 'consolidated' ? 'text-emerald-600' : 'text-gray-400'
            )} />
            <p className="font-medium text-gray-900">تسليم مجمّع</p>
            <p className="text-xs text-gray-500 mt-1">نقطة استلام مشتركة (أرخص)</p>
          </button>
        </div>
      </div>

      {/* Delivery Address (for individual) */}
      {formData.deliveryPreference === 'individual' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline ml-1" />
            عنوان التسليم
          </label>
          <textarea
            value={formData.deliveryAddress || ''}
            onChange={(e) => onUpdate({ deliveryAddress: e.target.value })}
            placeholder="أدخل العنوان الكامل لموقع التسليم..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
          />
        </div>
      )}

      {/* Incoterm Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Truck className="w-4 h-4 inline ml-1" />
          شروط التسليم (Incoterm)
        </label>
        <select
          value={formData.deliveryIncoterm || 'DDP'}
          onChange={(e) => onUpdate({ deliveryIncoterm: e.target.value as Incoterm })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          {(Object.entries(INCOTERM_LABELS) as [Incoterm, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}

interface StepCommitmentProps {
  formData: JoinDealFormData;
  onUpdate: (updates: Partial<JoinDealFormData>) => void;
  escrowAmount: number;
  escrowPercentage: number;
}

function StepCommitment({ formData, onUpdate, escrowAmount, escrowPercentage }: StepCommitmentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Commitment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          طريقة الالتزام
        </label>
        <div className="space-y-3">
          {/* PO Option */}
          <button
            onClick={() => onUpdate({ commitmentMethod: 'po' })}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-right transition-all',
              formData.commitmentMethod === 'po'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-start gap-3">
              <FileText className={cn(
                'w-6 h-6 mt-0.5',
                formData.commitmentMethod === 'po' ? 'text-emerald-600' : 'text-gray-400'
              )} />
              <div>
                <p className="font-medium text-gray-900">أمر شراء (PO)</p>
                <p className="text-sm text-gray-500 mt-1">
                  رفع أمر شراء رسمي من مصنعك كإثبات للالتزام
                </p>
              </div>
            </div>
          </button>

          {/* Escrow Option */}
          <button
            onClick={() => onUpdate({ commitmentMethod: 'escrow' })}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-right transition-all',
              formData.commitmentMethod === 'escrow'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-start gap-3">
              <Shield className={cn(
                'w-6 h-6 mt-0.5',
                formData.commitmentMethod === 'escrow' ? 'text-emerald-600' : 'text-gray-400'
              )} />
              <div>
                <p className="font-medium text-gray-900">ضمان مالي (Escrow)</p>
                <p className="text-sm text-gray-500 mt-1">
                  دفع {escrowPercentage}% كضمان ({formatCurrency(escrowAmount)}) - يُسترد عند التسليم
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* PO Details */}
      {formData.commitmentMethod === 'po' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم أمر الشراء
            </label>
            <input
              type="text"
              value={formData.poNumber || ''}
              onChange={(e) => onUpdate({ poNumber: e.target.value })}
              placeholder="PO-2025-XXXXX"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رفع ملف أمر الشراء
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">اسحب الملف هنا أو انقر للرفع</p>
              <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG (حتى 10MB)</p>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Info */}
      {formData.commitmentMethod === 'escrow' && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">ملاحظة هامة</p>
              <p className="text-sm text-amber-700 mt-1">
                سيتم تحويلك لبوابة الدفع بعد التأكيد. مبلغ الضمان ({formatCurrency(escrowAmount)}) سيُحفظ في حساب وسيط ويُسترد كاملاً عند استلام الطلب.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface StepReviewProps {
  deal: ProcurementDeal;
  formData: JoinDealFormData;
  currentTier: PricingTier | null;
  pricePerUnit: number;
  totalAmount: number;
  escrowAmount: number;
  savedAmount: number;
}

function StepReview({
  deal,
  formData,
  currentTier,
  pricePerUnit,
  totalAmount,
  escrowAmount,
  savedAmount,
}: StepReviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">مراجعة طلب الانضمام</h3>
        <p className="text-sm text-gray-500">تأكد من صحة البيانات قبل الإرسال</p>
      </div>

      <div className="space-y-4">
        {/* Order Summary */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-medium text-gray-700 mb-3">ملخص الطلب</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">المادة:</span>
              <span className="font-medium text-gray-900">{deal.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">الكمية:</span>
              <span className="font-medium text-gray-900">{formatNumber(formData.quantity)} {deal.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">الشريحة:</span>
              <span className="font-medium text-emerald-600">{currentTier?.tierLabel || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">سعر الوحدة:</span>
              <span className="font-medium text-gray-900">{formatCurrency(pricePerUnit)}/{deal.unit}</span>
            </div>
          </div>
        </div>

        {/* Delivery Summary */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-medium text-gray-700 mb-3">التسليم</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">نوع التسليم:</span>
              <span className="font-medium text-gray-900">
                {formData.deliveryPreference === 'individual' ? 'تسليم فردي' : 'تسليم مجمّع'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">شروط التسليم:</span>
              <span className="font-medium text-gray-900">
                {INCOTERM_LABELS[formData.deliveryIncoterm || 'DDP']}
              </span>
            </div>
            {formData.deliveryAddress && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-500">العنوان:</span>
                <p className="font-medium text-gray-900 mt-1">{formData.deliveryAddress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-4 bg-gradient-to-l from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <h4 className="font-medium text-gray-700 mb-3">الملخص المالي</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">إجمالي الطلب:</span>
              <span className="font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
            {formData.commitmentMethod === 'escrow' && (
              <div className="flex justify-between">
                <span className="text-gray-600">الضمان ({deal.escrowPercentage}%):</span>
                <span className="font-bold text-amber-600">{formatCurrency(escrowAmount)}</span>
              </div>
            )}
            {savedAmount > 0 && (
              <div className="flex justify-between pt-2 border-t border-emerald-200">
                <span className="text-emerald-600">التوفير:</span>
                <span className="font-bold text-emerald-600">{formatCurrency(savedAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Commitment Method */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            {formData.commitmentMethod === 'po' ? (
              <>
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">أمر شراء: {formData.poNumber || 'لم يُحدد'}</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-gray-900">ضمان مالي: {formatCurrency(escrowAmount)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default JoinDealModal;
