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

  const sortedTiers = useMemo(
    () => [...pricingTiers].sort((a, b) => a.tierIndex - b.tierIndex),
    [pricingTiers]
  );

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
    <div className={cn('bg-card rounded-2xl p-6 shadow-sm border border-border', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-foreground to-[#575757] flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-background" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">مُجمّع الأسعار الذكي</h3>
            <p className="text-sm text-muted-foreground">كلما زادت الكمية، انخفض السعر</p>
          </div>
        </div>

        {currentTier && (
          <div className="px-3 py-1.5 rounded-full bg-muted text-foreground text-sm font-medium">
            {currentTier.tierLabel}
          </div>
        )}
      </div>

      <div className="relative mb-8">
        <div className="flex items-end gap-1 h-32 mb-4">
          {sortedTiers.map((tier, index) => {
            const isCurrentTier = currentTier?.id === tier.id;
            const isPastTier = currentTier ? tier.tierIndex < currentTier.tierIndex : false;
            const isFutureTier = currentTier ? tier.tierIndex > currentTier.tierIndex : true;

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
                    isCurrentTier && 'bg-gradient-to-t from-foreground to-[#575757] shadow-lg shadow-black/10',
                    isPastTier && 'bg-[#E6E6E6]',
                    isFutureTier && 'bg-gradient-to-t from-[#F2F2F2] to-white border border-dashed border-[#E6E6E6]'
                  )}
                />

                <div
                  className={cn(
                    'absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium',
                    isCurrentTier ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {formatCurrency(tier.pricePerUnit)}
                </div>

                {tier.discountPercentage > 0 && (
                  <div
                    className={cn(
                      'absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold',
                      isCurrentTier
                        ? 'bg-muted text-foreground'
                        : 'bg-[#F2F2F2] text-muted-foreground'
                    )}
                  >
                    -{tier.discountPercentage}%
                  </div>
                )}

                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                  {tier.tierLabel}: {formatNumber(tier.minQuantity)}+ {deal.unit}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="relative h-3 bg-[#F2F2F2] rounded-full overflow-hidden mt-8">
          <motion.div
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-foreground to-[#575757] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {tierMarkers.map(({ tier, position }) => (
            <div
              key={tier.id}
              className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-[#E6E6E6] rounded-full"
              style={{ right: `${position}%` }}
            />
          ))}
        </div>

        <div
          className="absolute -bottom-2 transform -translate-x-1/2"
          style={{ right: `${progressPercentage}%` }}
        >
          <div className="w-4 h-4 rounded-full bg-foreground border-2 border-background shadow" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 rounded-xl bg-muted">
          <p className="text-xs text-muted-foreground mb-1">السعر الحالي</p>
          <p className="font-bold text-foreground">{formatCurrency(currentPricePerUnit)}</p>
          <p className="text-xs text-muted-foreground">/{deal.unit}</p>
        </div>

        <div className="text-center p-3 rounded-xl bg-muted">
          <p className="text-xs text-muted-foreground mb-1">سعر السوق</p>
          <p className="font-bold text-muted-foreground line-through">{formatCurrency(deal.marketPricePerUnit)}</p>
          <p className="text-xs text-muted-foreground">/{deal.unit}</p>
        </div>

        <div className="text-center p-3 rounded-xl bg-muted">
          <p className="text-xs text-foreground mb-1">التوفير الحالي</p>
          <p className="font-bold text-foreground">{currentSavingsPercentage}%</p>
          <p className="text-xs text-muted-foreground">من سعر السوق</p>
        </div>

        <div className="text-center p-3 rounded-xl bg-muted">
          <p className="text-xs text-foreground mb-1">المشاركون</p>
          <p className="font-bold text-foreground">{formatNumber(participantCount)}</p>
          <p className="text-xs text-muted-foreground">مصنع</p>
        </div>
      </div>

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
              <p className="text-sm font-medium text-foreground">
                باقي <span className="text-amber-600 font-bold">{formatNumber(quantityToNextTier)} {deal.unit}</span> للوصول للشريحة التالية
              </p>
              <p className="text-xs text-muted-foreground">
                {nextTier.tierLabel}: {formatCurrency(nextTier.pricePerUnit)}/{deal.unit}
                <span className="text-foreground mr-1">(-{nextTier.discountPercentage}%)</span>
              </p>
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>
      )}

      {timeRemaining && !isDeadlinePassed && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
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
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-lg font-bold text-foreground">{formatCurrency(currentPricePerUnit)}</span>
          <span className="text-xs text-muted-foreground mr-1">/طن</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground line-through">{formatCurrency(marketPrice)}</span>
          <span className="px-2 py-0.5 rounded-full bg-muted text-foreground text-xs font-bold">
            -{currentSavingsPercentage}%
          </span>
        </div>
      </div>

      <div className="relative h-1.5 bg-[#F2F2F2] rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 right-0 bg-gradient-to-l from-foreground to-[#575757] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {currentTier && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{currentTier.tierLabel}</span>
          <span className="text-foreground font-medium">{progressPercentage}% مكتمل</span>
        </div>
      )}
    </div>
  );
}

export default SmartAggregator;
