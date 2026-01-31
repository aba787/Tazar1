'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { SupplierBid, BidEvaluation } from '@/types';
import { BID_STATUS_LABELS, INCOTERM_LABELS } from '@/types';
import {
  Building2,
  Clock,
  Truck,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  BarChart3,
  ExternalLink,
  Package,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SupplierBidCardProps {
  bid: SupplierBid;
  marketPrice: number;
  unit: string;
  onSelect?: (bidId: string) => void;
  onCompare?: (bidId: string, isSelected: boolean) => void;
  isSelected?: boolean;
  isComparing?: boolean;
  showEvaluation?: boolean;
  className?: string;
}

export function SupplierBidCard({
  bid,
  marketPrice,
  unit,
  onSelect,
  onCompare,
  isSelected = false,
  isComparing = false,
  showEvaluation = false,
  className,
}: SupplierBidCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const savingsPercentage = Math.round(((marketPrice - bid.pricePerUnit) / marketPrice) * 100);
  const isAwarded = bid.status === 'awarded';
  const isRejected = bid.status === 'rejected';

  return (
    <motion.div
      layout
      className={cn(
        'bg-white rounded-2xl border-2 overflow-hidden transition-all',
        isSelected && 'border-emerald-500 shadow-lg shadow-emerald-100',
        isAwarded && 'border-amber-400 bg-gradient-to-l from-amber-50 to-white',
        isRejected && 'border-gray-200 opacity-60',
        !isSelected && !isAwarded && !isRejected && 'border-gray-100 hover:border-gray-200',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Supplier Logo/Avatar */}
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isAwarded ? 'bg-amber-100' : 'bg-gray-100'
            )}>
              {isAwarded ? (
                <Award className="w-6 h-6 text-amber-600" />
              ) : (
                <Building2 className="w-6 h-6 text-gray-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">
                  {bid.supplier?.name || 'مورد'}
                </h3>
                {bid.supplier?.verified && (
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {bid.supplier?.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {bid.supplier.rating.toFixed(1)}
                  </span>
                )}
                <span>•</span>
                <span>{bid.supplier?.total_orders || 0} طلب مكتمل</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            bid.status === 'awarded' && 'bg-amber-100 text-amber-700',
            bid.status === 'shortlisted' && 'bg-blue-100 text-blue-700',
            bid.status === 'submitted' && 'bg-gray-100 text-gray-700',
            bid.status === 'under_review' && 'bg-purple-100 text-purple-700',
            bid.status === 'rejected' && 'bg-red-100 text-red-700',
            bid.status === 'withdrawn' && 'bg-gray-100 text-gray-500',
          )}>
            {BID_STATUS_LABELS[bid.status]}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Price & Savings */}
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(bid.pricePerUnit)}
            </span>
            <span className="text-sm text-gray-400 mr-1">/{unit}</span>
          </div>
          {savingsPercentage > 0 && (
            <div className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold">
              توفير {savingsPercentage}%
            </div>
          )}
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Lead Time */}
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-900">{bid.leadTimeDays} يوم</p>
            <p className="text-xs text-gray-500">مدة التسليم</p>
          </div>

          {/* Incoterm */}
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <Truck className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-900">{bid.incoterm}</p>
            <p className="text-xs text-gray-500">شروط التسليم</p>
          </div>

          {/* Capacity */}
          <div className="p-3 rounded-xl bg-gray-50 text-center">
            <Package className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-900">
              {bid.totalCapacity ? formatNumber(bid.totalCapacity) : '-'}
            </p>
            <p className="text-xs text-gray-500">السعة القصوى</p>
          </div>
        </div>

        {/* Compliance Indicators */}
        <div className="flex flex-wrap gap-2 mb-4">
          {bid.sampleAvailable && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
              <CheckCircle2 className="w-3 h-3" />
              عينات متاحة
            </span>
          )}
          {bid.technicalProposalUrl && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-600 text-xs">
              <FileText className="w-3 h-3" />
              عرض فني
            </span>
          )}
          {bid.commercialProposalUrl && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal-50 text-teal-600 text-xs">
              <FileText className="w-3 h-3" />
              عرض تجاري
            </span>
          )}
        </div>

        {/* Evaluation Scores (if available and showEvaluation is true) */}
        {showEvaluation && bid.evaluation && (
          <EvaluationScores evaluation={bid.evaluation} />
        )}

        {/* Expandable Details */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pt-4 border-t border-gray-100 mt-2 space-y-3"
          >
            {/* Payment Terms */}
            {bid.paymentTerms && (
              <div>
                <p className="text-xs text-gray-500 mb-1">شروط الدفع:</p>
                <p className="text-sm text-gray-700">{bid.paymentTerms}</p>
              </div>
            )}

            {/* Delivery Location */}
            {bid.deliveryLocation && (
              <div>
                <p className="text-xs text-gray-500 mb-1">موقع التسليم:</p>
                <p className="text-sm text-gray-700">{bid.deliveryLocation}</p>
              </div>
            )}

            {/* Validity */}
            {bid.validUntil && (
              <div>
                <p className="text-xs text-gray-500 mb-1">صالح حتى:</p>
                <p className="text-sm text-gray-700">
                  {new Date(bid.validUntil).toLocaleDateString('ar-SA')}
                </p>
              </div>
            )}

            {/* Notes */}
            {bid.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1">ملاحظات:</p>
                <p className="text-sm text-gray-700">{bid.notes}</p>
              </div>
            )}

            {/* Document Links */}
            <div className="flex gap-2 pt-2">
              {bid.technicalProposalUrl && (
                <a
                  href={bid.technicalProposalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>العرض الفني</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {bid.commercialProposalUrl && (
                <a
                  href={bid.commercialProposalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>العرض التجاري</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Actions Footer */}
      {(onSelect || onCompare) && !isRejected && (
        <div className="px-4 pb-4 flex gap-2">
          {onCompare && (
            <button
              onClick={() => onCompare(bid.id, !isComparing)}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isComparing
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {isComparing ? 'إزالة من المقارنة' : 'إضافة للمقارنة'}
            </button>
          )}
          {onSelect && !isAwarded && (
            <button
              onClick={() => onSelect(bid.id)}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isSelected
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              )}
            >
              {isSelected ? 'تم الاختيار' : 'اختيار العرض'}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ========== Evaluation Scores Component ==========

interface EvaluationScoresProps {
  evaluation: BidEvaluation;
}

function EvaluationScores({ evaluation }: EvaluationScoresProps) {
  const scores = [
    { label: 'السعر', score: evaluation.priceScore, weight: evaluation.priceWeight, color: 'emerald' },
    { label: 'الجودة', score: evaluation.qualityScore, weight: evaluation.qualityWeight, color: 'blue' },
    { label: 'التسليم', score: evaluation.deliveryScore, weight: evaluation.deliveryWeight, color: 'amber' },
    { label: 'الامتثال', score: evaluation.complianceScore, weight: evaluation.complianceWeight, color: 'purple' },
  ];

  return (
    <div className="p-4 rounded-xl bg-gradient-to-l from-gray-50 to-white border border-gray-100 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">تقييم العرض</span>
        <span className="mr-auto text-lg font-bold text-gray-900">
          {evaluation.weightedScore.toFixed(1)}
        </span>
      </div>

      <div className="space-y-2">
        {scores.map(({ label, score, weight, color }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-16 text-xs text-gray-500">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  color === 'emerald' && 'bg-emerald-500',
                  color === 'blue' && 'bg-blue-500',
                  color === 'amber' && 'bg-amber-500',
                  color === 'purple' && 'bg-purple-500',
                )}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </div>
            <span className="w-12 text-xs font-medium text-gray-700 text-left">
              {score} <span className="text-gray-400">({weight}%)</span>
            </span>
          </div>
        ))}
      </div>

      {evaluation.comments && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">{evaluation.comments}</p>
        </div>
      )}
    </div>
  );
}

export default SupplierBidCard;
