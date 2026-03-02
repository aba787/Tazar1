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

  const [formData, setFormData] = useState<JoinDealFormData>({
    quantity: deal.minQuantity || 10,
    deliveryPreference: 'individual',
    commitmentMethod: 'escrow',
  });

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
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden mx-4"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">الانضمام للصفقة</h2>
            <p className="text-sm text-muted-foreground">{deal.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-4 bg-muted border-b border-border">
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
                        isActive && 'bg-foreground text-background',
                        isCompleted && 'bg-[#E6E6E6] text-foreground',
                        !isActive && !isCompleted && 'bg-background text-muted-foreground'
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
                        isActive && 'text-foreground',
                        isCompleted && 'text-muted-foreground',
                        !isActive && !isCompleted && 'text-muted-foreground'
                      )}
                    >
                      {s.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-4',
                        isCompleted ? 'bg-[#575757]' : 'bg-[#E6E6E6]'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

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

        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>{step === 1 ? 'إلغاء' : 'رجوع'}</span>
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-xl font-medium hover:bg-[#575757] transition-colors"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-xl font-medium hover:bg-[#575757] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span>جاري الإرسال...</span>
                  <motion.div
                    className="w-4 h-4 border-2 border-background border-t-transparent rounded-full"
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
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          الكمية المطلوبة ({deal.unit})
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => adjustQuantity(-10)}
            className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <Minus className="w-5 h-5 text-muted-foreground" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(minQty, Math.min(maxQty, Number(e.target.value) || minQty)))}
            className="flex-1 text-center text-2xl font-bold py-3 border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-foreground bg-background"
          />
          <button
            onClick={() => adjustQuantity(10)}
            className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <Plus className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          الحد الأدنى: {formatNumber(minQty)} {deal.unit} | الحد الأقصى: {formatNumber(maxQty)} {deal.unit}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-l from-muted to-accent border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-5 h-5 text-foreground" />
          <span className="font-medium text-foreground">حاسبة السعر المباشر</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-background rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">سعر الوحدة</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(pricePerUnit)}</p>
            <p className="text-xs text-muted-foreground">/{deal.unit}</p>
          </div>
          <div className="text-center p-3 bg-background rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">الإجمالي</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalAmount)}</p>
            {savingsPercentage > 0 && (
              <p className="text-xs text-muted-foreground">توفير {savingsPercentage}%</p>
            )}
          </div>
        </div>

        {currentTier && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الشريحة الحالية:</span>
              <span className="font-medium text-foreground">{currentTier.tierLabel}</span>
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
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          نوع التسليم
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onUpdate({ deliveryPreference: 'individual' })}
            className={cn(
              'p-4 rounded-xl border-2 text-right transition-all',
              formData.deliveryPreference === 'individual'
                ? 'border-foreground bg-muted'
                : 'border-border hover:border-muted-foreground'
            )}
          >
            <Building2 className={cn(
              'w-6 h-6 mb-2',
              formData.deliveryPreference === 'individual' ? 'text-foreground' : 'text-muted-foreground'
            )} />
            <p className="font-medium text-foreground">تسليم فردي</p>
            <p className="text-xs text-muted-foreground mt-1">التسليم مباشرة لموقع مصنعك</p>
          </button>

          <button
            onClick={() => onUpdate({ deliveryPreference: 'consolidated' })}
            className={cn(
              'p-4 rounded-xl border-2 text-right transition-all',
              formData.deliveryPreference === 'consolidated'
                ? 'border-foreground bg-muted'
                : 'border-border hover:border-muted-foreground'
            )}
          >
            <Package className={cn(
              'w-6 h-6 mb-2',
              formData.deliveryPreference === 'consolidated' ? 'text-foreground' : 'text-muted-foreground'
            )} />
            <p className="font-medium text-foreground">تسليم مجمّع</p>
            <p className="text-xs text-muted-foreground mt-1">نقطة استلام مشتركة (أرخص)</p>
          </button>
        </div>
      </div>

      {formData.deliveryPreference === 'individual' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <MapPin className="w-4 h-4 inline ml-1" />
            عنوان التسليم
          </label>
          <textarea
            value={formData.deliveryAddress || ''}
            onChange={(e) => onUpdate({ deliveryAddress: e.target.value })}
            placeholder="أدخل العنوان الكامل لموقع التسليم..."
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-foreground resize-none bg-background"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <Truck className="w-4 h-4 inline ml-1" />
          شروط التسليم (Incoterm)
        </label>
        <select
          value={formData.deliveryIncoterm || 'DDP'}
          onChange={(e) => onUpdate({ deliveryIncoterm: e.target.value as Incoterm })}
          className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-foreground bg-background"
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
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          طريقة الالتزام
        </label>
        <div className="space-y-3">
          <button
            onClick={() => onUpdate({ commitmentMethod: 'po' })}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-right transition-all',
              formData.commitmentMethod === 'po'
                ? 'border-foreground bg-muted'
                : 'border-border hover:border-muted-foreground'
            )}
          >
            <div className="flex items-start gap-3">
              <FileText className={cn(
                'w-6 h-6 mt-0.5',
                formData.commitmentMethod === 'po' ? 'text-foreground' : 'text-muted-foreground'
              )} />
              <div>
                <p className="font-medium text-foreground">أمر شراء (PO)</p>
                <p className="text-sm text-muted-foreground mt-1">
                  رفع أمر شراء رسمي من مصنعك كإثبات للالتزام
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onUpdate({ commitmentMethod: 'escrow' })}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-right transition-all',
              formData.commitmentMethod === 'escrow'
                ? 'border-foreground bg-muted'
                : 'border-border hover:border-muted-foreground'
            )}
          >
            <div className="flex items-start gap-3">
              <Shield className={cn(
                'w-6 h-6 mt-0.5',
                formData.commitmentMethod === 'escrow' ? 'text-foreground' : 'text-muted-foreground'
              )} />
              <div>
                <p className="font-medium text-foreground">ضمان مالي (Escrow)</p>
                <p className="text-sm text-muted-foreground mt-1">
                  دفع {escrowPercentage}% كضمان ({formatCurrency(escrowAmount)}) - يُسترد عند التسليم
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {formData.commitmentMethod === 'po' && (
        <div className="space-y-4 p-4 bg-muted rounded-xl">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              رقم أمر الشراء
            </label>
            <input
              type="text"
              value={formData.poNumber || ''}
              onChange={(e) => onUpdate({ poNumber: e.target.value })}
              placeholder="PO-2025-XXXXX"
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-foreground bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              رفع ملف أمر الشراء
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-muted-foreground transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">اسحب الملف هنا أو انقر للرفع</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG (حتى 10MB)</p>
            </div>
          </div>
        </div>
      )}

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
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-8 h-8 text-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">مراجعة طلب الانضمام</h3>
        <p className="text-sm text-muted-foreground">تأكد من صحة البيانات قبل الإرسال</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-xl">
          <h4 className="font-medium text-foreground mb-3">ملخص الطلب</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">المادة:</span>
              <span className="font-medium text-foreground">{deal.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الكمية:</span>
              <span className="font-medium text-foreground">{formatNumber(formData.quantity)} {deal.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الشريحة:</span>
              <span className="font-medium text-foreground">{currentTier?.tierLabel || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">سعر الوحدة:</span>
              <span className="font-medium text-foreground">{formatCurrency(pricePerUnit)}/{deal.unit}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-xl">
          <h4 className="font-medium text-foreground mb-3">التسليم</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">نوع التسليم:</span>
              <span className="font-medium text-foreground">
                {formData.deliveryPreference === 'individual' ? 'تسليم فردي' : 'تسليم مجمّع'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">شروط التسليم:</span>
              <span className="font-medium text-foreground">
                {INCOTERM_LABELS[formData.deliveryIncoterm || 'DDP']}
              </span>
            </div>
            {formData.deliveryAddress && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground">العنوان:</span>
                <p className="font-medium text-foreground mt-1">{formData.deliveryAddress}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-l from-muted to-accent rounded-xl border border-border">
          <h4 className="font-medium text-foreground mb-3">الملخص المالي</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">إجمالي الطلب:</span>
              <span className="font-bold text-foreground">{formatCurrency(totalAmount)}</span>
            </div>
            {formData.commitmentMethod === 'escrow' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">الضمان ({deal.escrowPercentage}%):</span>
                <span className="font-bold text-amber-600">{formatCurrency(escrowAmount)}</span>
              </div>
            )}
            {savedAmount > 0 && (
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-foreground">التوفير:</span>
                <span className="font-bold text-foreground">{formatCurrency(savedAmount)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-muted rounded-xl">
          <div className="flex items-center gap-2">
            {formData.commitmentMethod === 'po' ? (
              <>
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">أمر شراء: {formData.poNumber || 'لم يُحدد'}</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-foreground" />
                <span className="font-medium text-foreground">ضمان مالي: {formatCurrency(escrowAmount)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default JoinDealModal;
