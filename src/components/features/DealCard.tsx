'use client';

import * as React from 'react';
import { Users, Clock, CheckCircle2 } from 'lucide-react';
import { Badge, Progress } from '@/components/ui';
import { cn } from '@/lib/utils';

export type DealStatus = 'GATHERING' | 'NEGOTIATING' | 'CLOSED';

export interface Deal {
  id: string;
  title: string;
  status: DealStatus;
  participants: { current: number; target: number };
  savings: number;
  endDate: string;
  progress: number;
}

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
}

const statusConfig: Record<
  DealStatus,
  {
    label: string;
    badgeVariant: 'info' | 'success' | 'secondary';
    badgeStyle: string;
  }
> = {
  GATHERING: {
    label: 'جاري التجميع',
    badgeVariant: 'info',
    badgeStyle: 'bg-foreground text-background border-foreground',
  },
  NEGOTIATING: {
    label: 'التفاوض',
    badgeVariant: 'success',
    badgeStyle: 'bg-[#575757] text-white border-[#575757]',
  },
  CLOSED: {
    label: 'مكتمل',
    badgeVariant: 'secondary',
    badgeStyle: 'bg-muted-foreground text-white border-muted-foreground',
  },
};

export function DealCard({ deal, onClick }: DealCardProps) {
  const { participants, status, savings, endDate, title, progress } = deal;
  const config = statusConfig[status];

  const isTargetMet = participants.current >= participants.target;

  const progressValue = (status === 'NEGOTIATING' || status === 'CLOSED') ? 100 : progress;

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border bg-card p-4 transition-all hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <Badge className={config.badgeStyle}>{config.label}</Badge>
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              {isTargetMet ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-foreground" />
                  <span className="text-foreground font-medium">
                    {participants.current} مشارك
                  </span>
                  <span className="text-foreground text-xs">(تم تحقيق الهدف)</span>
                </>
              ) : (
                <>
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {participants.current}/{participants.target} مشارك
                  </span>
                </>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(endDate).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-left">
            <p className="text-lg font-bold text-foreground font-numbers">
              {savings}%
            </p>
            <p className="text-xs text-muted-foreground">توفير</p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>التقدم</span>
          <span className="font-numbers">{progressValue}%</span>
        </div>
        <Progress
          value={progressValue}
          max={100}
        />
      </div>
    </div>
  );
}
