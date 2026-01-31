'use client';

import * as React from 'react';
import { Users, Clock, CheckCircle2 } from 'lucide-react';
import { Badge, Progress } from '@/components/ui';
import { cn } from '@/lib/utils';

// Types
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

// Status configuration - Apple Design System
const statusConfig: Record<
  DealStatus,
  {
    label: string;
    badgeVariant: 'info' | 'success' | 'secondary'; // أزرق | أخضر | رمادي
    badgeStyle: string; // Apple colors
  }
> = {
  GATHERING: {
    label: 'جاري التجميع',
    badgeVariant: 'info',
    badgeStyle: 'bg-[#007AFF] text-white border-[#007AFF]', // Apple Blue
  },
  NEGOTIATING: {
    label: 'التفاوض',
    badgeVariant: 'success',
    badgeStyle: 'bg-[#34C759] text-white border-[#34C759]', // Apple Green
  },
  CLOSED: {
    label: 'مكتمل',
    badgeVariant: 'secondary',
    badgeStyle: 'bg-[#8E8E93] text-white border-[#8E8E93]', // Apple Gray
  },
};

export function DealCard({ deal, onClick }: DealCardProps) {
  const { participants, status, savings, endDate, title, progress } = deal;
  const config = statusConfig[status];

  // Check if target is met
  const isTargetMet = participants.current >= participants.target;

  // Calculate progress value - 100% if status is NEGOTIATING or CLOSED
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
            {/* Participant Count with new logic */}
            <span className="flex items-center gap-1">
              {isTargetMet ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">
                    {participants.current} مشارك
                  </span>
                  <span className="text-emerald-600 text-xs">(تم تحقيق الهدف)</span>
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
            <p className="text-lg font-bold text-emerald-600 font-numbers">
              {savings}%
            </p>
            <p className="text-xs text-muted-foreground">توفير</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
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
