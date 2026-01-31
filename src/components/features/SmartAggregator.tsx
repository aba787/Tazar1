'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { PricingTier, AggregatorDisplayData } from '@/types';
import {
  TrendingDown,
  Users,
  Clock,
  Target,
  ChevronLeft,
  Zap,
} from 'lucide-react';

interface SmartAggregatorProps {
  data: AggregatorDisplayData;
  className?: string;
  compact?: boolean;
}

export function SmartAggregator({ data, className, compact = false }: SmartAggregatorProps) {
  const {
    deal,
    currentTier,
    nextTier,
    quantityToNextTier,
    currentPricePerUnit,
    bestPricePerUnit,
    totalSavingsPercentage,
    currentSavingsPercentage,
    progressPercentage,
    participantCount,
    timeRemaining,
    isDeadlinePassed,
  } = data;

  const { pricingTiers } = deal;

  // ترتيب الشرائح
  const sortedTiers = useMemo(
    () => [...pricingTiers].sort((a, b) => a.tierIndex - b.tierIndex),
    [pricingTiers]
  );

  // حساب مواقع علامات الشرائح على شريط التقدم
  const tierMarkers = useMemo(() => {
    const maxQty = deal.maxQuantity || sortedTiers[sortedTiers.length - 1]?.minQuantity * 2 || 1000;
    return sortedTiers.map(tier => ({
      tier,
      position: (tier.minQuantity / maxQty) * 100,
    }));
  }, [sortedTiers, deal.maxQuantity]);

  if (compact) {
    return (
      <CompactAggregator
        currentTier={currentTier}
        nextTier={nextTier}
        currentPricePerUnit={currentPricePerUnit}
        marketPrice={deal.marketPricePerUnit}
        currentSavingsPercentage={currentSavingsPercentage}
        progressPercentage={progressPercentage}
        className={className}
      />
    );
  }

  return (
    <div className={cn('bg-white rounded-2xl p-6 shadow-sm border border-gray-100', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">مُجمّع الأسعار الذكي</h3>
            <p className="text-sm text-gray-500">كلما زادت الكمية، انخفض السعر</p>
          </div>
        </div>

        {/* الشريحة الحالية */}
        {currentTier && (
          <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
            {currentTier.tierLabel}
          </div>
        )}
      </div>

      {/* Tiered Pricing Visualization */}
      <div className="relative mb-8">
        {/* Tier Bars */}
        <div className="flex items-end gap-1 h-32 mb-4">
          {sortedTiers.map((tier, index) => {
            const isCurrentTier = currentTier?.id === tier.id;
            const isPastTier = currentTier ? tier.tierIndex < currentTier.tierIndex : false;
            const isFutureTier = currentTier ? tier.tierIndex > currentTier.tierIndex : true;

            // حساب ارتفاع العمود بناءً على الخصم (أعلى خصم = أقصر عمود)
            const maxDiscount = Math.max(...sortedTiers.map(t => t.discountPercentage));
            const heightPercentage = 100 - (tier.discountPercentage / (maxDiscount || 1)) * 50;

            return (
              <motion.div
                key={tier.id}
                className="flex-1 relative group cursor-pointer"
                initial={{ height: 0 }}
                animate={{ height: `${heightPercentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className={cn(
                    'w-full h-full rounded-t-lg transition-all duration-300',
                    isCurrentTier && 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-200',
                    isPastTier && 'bg-gray-200',
                    isFutureTier && 'bg-gradient-to-t from-gray-100 to-gray-50 border border-dashed border-gray-300'
                  )}
                />

                {/* Price Label */}
                <div
                  className={cn(
                    'absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium',
                    isCurrentTier ? 'text-emerald-600' : 'text-gray-500'
                  )}
                >
                  {formatCurrency(tier.pricePerUnit)}
                </div>

                {/* Discount Badge */}
                {tier.discountPercentage > 0 && (
                  <div
                    className={cn(
                      'absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold',
                      isCurrentTier
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    -{tier.discountPercentage}%
                  </div>
                )}

                {/* Tier Label on Hover */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {tier.tierLabel}: {formatNumber(tier.minQuantity)}+ {deal.unit}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar with Tier Markers */}
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mt-8">
          <motion.div
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-500 to-teal-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Tier Markers */}
          {tierMarkers.map(({ tier, position }) => (
            <div
              key={tier.id}
              className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-gray-300 rounded-full"
              style={{ right: `${position}%` }}
            />
          ))}
        </div>

        {/* Current Quantity Indicator */}
        <div
          className="absolute -bottom-2 transform -translate-x-1/2"
          style={{ right: `${progressPercentage}%` }}
        >
          <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* السعر الحالي */}
        <div className="text-center p-3 rounded-xl bg-gray-50">
          <p className="text-xs text-gray-500 mb-1">السعر الحالي</p>
          <p className="font-bold text-gray-900">{formatCurrency(currentPricePerUnit)}</p>
          <p className="text-xs text-gray-400">/{deal.unit}</p>
        </div>

        {/* سعر السوق */}
        <div className="text-center p-3 rounded-xl bg-gray-50">
          <p className="text-xs text-gray-500 mb-1">سعر السوق</p>
          <p className="font-bold text-gray-400 line-through">{formatCurrency(deal.marketPricePerUnit)}</p>
          <p className="text-xs text-gray-400">/{deal.unit}</p>
        </div>

        {/* التوفير */}
        <div className="text-center p-3 rounded-xl bg-emerald-50">
          <p className="text-xs text-emerald-600 mb-1">التوفير الحالي</p>
          <p className="font-bold text-emerald-600">{currentSavingsPercentage}%</p>
          <p className="text-xs text-emerald-500">من سعر السوق</p>
        </div>

        {/* المشاركون */}
        <div className="text-center p-3 rounded-xl bg-blue-50">
          <p className="text-xs text-blue-600 mb-1">المشاركون</p>
          <p className="font-bold text-blue-600">{formatNumber(participantCount)}</p>
          <p className="text-xs text-blue-500">مصنع</p>
        </div>
      </div>

      {/* Next Tier CTA */}
      {nextTier && quantityToNextTier > 0 && (
        <motion.div
          className="p-4 rounded-xl bg-gradient-to-l from-amber-50 to-orange-50 border border-amber-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                باقي <span className="text-amber-600 font-bold">{formatNumber(quantityToNextTier)} {deal.unit}</span> للوصول للشريحة التالية
              </p>
              <p className="text-xs text-gray-500">
                {nextTier.tierLabel}: {formatCurrency(nextTier.pricePerUnit)}/{deal.unit}
                <span className="text-emerald-600 mr-1">(-{nextTier.discountPercentage}%)</span>
              </p>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </div>
        </motion.div>
      )}

      {/* Time Remaining */}
      {timeRemaining && !isDeadlinePassed && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            متبقي: {timeRemaining.days} يوم، {timeRemaining.hours} ساعة، {timeRemaining.minutes} دقيقة
          </span>
        </div>
      )}

      {isDeadlinePassed && (
        <div className="mt-4 text-center text-sm text-red-500 font-medium">
          انتهت فترة التجميع
        </div>
      )}
    </div>
  );
}

// ========== Compact Version ==========

interface CompactAggregatorProps {
  currentTier: PricingTier | null;
  nextTier: PricingTier | null;
  currentPricePerUnit: number;
  marketPrice: number;
  currentSavingsPercentage: number;
  progressPercentage: number;
  className?: string;
}

function CompactAggregator({
  currentTier,
  currentPricePerUnit,
  marketPrice,
  currentSavingsPercentage,
  progressPercentage,
  className,
}: CompactAggregatorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Price Display */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(currentPricePerUnit)}</span>
          <span className="text-xs text-gray-400 mr-1">/طن</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 line-through">{formatCurrency(marketPrice)}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
            -{currentSavingsPercentage}%
          </span>
        </div>
      </div>

      {/* Mini Progress */}
      <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-500 to-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Tier Label */}
      {currentTier && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">{currentTier.tierLabel}</span>
          <span className="text-emerald-600 font-medium">{progressPercentage}% مكتمل</span>
        </div>
      )}
    </div>
  );
}

export default SmartAggregator;
