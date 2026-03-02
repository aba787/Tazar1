'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  Factory,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Progress, Button } from '@/components/ui';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';

export type DetailedDealStatus = 'OPEN' | 'GATHERING' | 'NEGOTIATING' | 'COMPLETED';

export interface DetailedDeal {
  id: string;
  title: string;
  description: string;
  status: DetailedDealStatus;
  specs: string[];
  metrics: {
    quantity: { current: number; target: number; unit: string };
    participants: { current: number; target: number };
  };
  financials: {
    marketPrice: number;
    targetPrice: number;
    currency: string;
    savingsPercentage: number;
  };
  endDate: string;
  createdBy: string;
}

interface DetailedDealCardProps {
  deal: DetailedDeal;
  onJoin?: () => void;
  onViewDetails?: () => void;
  index?: number;
}

const statusConfig: Record<
  DetailedDealStatus,
  {
    label: string;
    badgeStyle: string;
  }
> = {
  OPEN: {
    label: 'مفتوح للانضمام',
    badgeStyle: 'bg-foreground text-background border-foreground',
  },
  GATHERING: {
    label: 'جاري التجميع',
    badgeStyle: 'bg-foreground text-background border-foreground',
  },
  NEGOTIATING: {
    label: 'التفاوض',
    badgeStyle: 'bg-[#575757] text-white border-[#575757]',
  },
  COMPLETED: {
    label: 'مكتمل',
    badgeStyle: 'bg-muted-foreground text-white border-muted-foreground',
  },
};

function isDeadlineApproaching(deadline: string): boolean {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays > 0;
}

export function DetailedDealCard({ deal, onJoin, onViewDetails, index = 0 }: DetailedDealCardProps) {
  const { status, specs, metrics, financials, endDate, createdBy, title, description } = deal;
  const config = statusConfig[status];

  const quantityProgress = (metrics.quantity.current / metrics.quantity.target) * 100;
  const participantProgress = (metrics.participants.current / metrics.participants.target) * 100;
  const deadlineApproaching = isDeadlineApproaching(endDate);
  const isTargetMet = metrics.participants.current >= metrics.participants.target;
  const canJoin = status === 'OPEN' || status === 'GATHERING';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="card-hover h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{title}</CardTitle>
                <Badge className={config.badgeStyle}>{config.label}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted px-3 py-2">
              <div className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-foreground" />
                <span className="text-xl font-bold text-foreground font-numbers">
                  {financials.savingsPercentage}%
                </span>
              </div>
              <span className="text-xs text-foreground">توفير</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {specs.map((spec, idx) => (
              <span
                key={idx}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {spec}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">الكمية المطلوبة</span>
                <span className="font-medium font-numbers">
                  {formatNumber(metrics.quantity.current)} / {formatNumber(metrics.quantity.target)} {metrics.quantity.unit}
                </span>
              </div>
              <Progress
                value={metrics.quantity.current}
                max={metrics.quantity.target}
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">المصانع المشاركة</span>
                <span className={cn(
                  "font-medium font-numbers flex items-center gap-1",
                  isTargetMet && "text-foreground"
                )}>
                  {isTargetMet ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {metrics.participants.current} مصنع
                      <span className="text-xs">(تم تحقيق الهدف)</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {metrics.participants.current} / {metrics.participants.target} مصنع
                    </>
                  )}
                </span>
              </div>
              <Progress
                value={metrics.participants.current}
                max={metrics.participants.target}
                size="sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gradient-to-l from-muted to-transparent p-3 border border-border">
            <div>
              <p className="text-xs text-muted-foreground">سعر السوق</p>
              <p className="font-medium line-through text-muted-foreground font-numbers">
                {formatCurrency(financials.marketPrice)}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">السعر المستهدف</p>
              <p className="text-lg font-bold text-foreground font-numbers">
                {formatCurrency(financials.targetPrice)}
              </p>
            </div>
          </div>

          <Button
            className="w-full"
            variant={canJoin ? 'default' : 'outline'}
            onClick={canJoin ? onJoin : onViewDetails}
          >
            {canJoin ? 'انضم الآن' : 'عرض التفاصيل'}
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>

          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>ينتهي {new Date(endDate).toLocaleDateString('ar-SA')}</span>
              {deadlineApproaching && (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">قريباً</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Factory className="h-3.5 w-3.5" />
              <span>{createdBy}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
