'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  Cog,
  ShoppingCart,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Badge, Button, Progress } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';

// ============================================================================
// DATA
// ============================================================================

const urgentActions = [
  { count: 2, label: 'صفقات تنتهي قريباً', type: 'warning' as const, link: '/group-buying' },
  { count: 1, label: 'طلب حجز بانتظار الموافقة', type: 'info' as const, link: '/capacity-exchange' },
  { count: 3, label: 'فرص جديدة مطابقة', type: 'success' as const, link: '/group-buying' },
];

const activeDeals = [
  {
    id: '1',
    title: 'ألومنيوم خام - دفعة مارس',
    progress: 75,
    participants: '8 مصانع (تم تحقيق الهدف ✓)',
    deadline: '2026/02/15',
    saving: 23,
    status: 'collecting' as const,
  },
  {
    id: '2',
    title: 'صفائح حديد مجلفن',
    progress: 56,
    participants: '4/6 مصانع',
    deadline: '2026/02/20',
    saving: 18,
    status: 'collecting' as const,
  },
  {
    id: '3',
    title: 'حبيبات بلاستيك HDPE',
    progress: 100,
    participants: '10 مصانع (تم تحقيق الهدف ✓)',
    deadline: '2026/02/10',
    saving: 27,
    status: 'negotiating' as const,
  },
];

const myEquipment = [
  {
    id: '1',
    name: 'ماكينة CNC خمس محاور',
    status: 'rented' as const,
    renterName: 'مصنع الفجر',
    untilDate: '2026/02/10',
    earnings: 750000,
  },
  {
    id: '2',
    name: 'مكبس هيدروليكي 200 طن',
    status: 'available' as const,
  },
  {
    id: '3',
    name: 'رافعة شوكية 5 طن',
    status: 'maintenance' as const,
  },
];

const recommendations = [
  {
    title: 'وفّر 32% على طلب النحاس',
    description: 'طلب مشابه لاحتياجاتك متاح الآن مع 7 مصانع أخرى',
    potentialSaving: '12,000 ر.س.',
  },
  {
    title: 'آلة لحام متاحة قريباً منك',
    description: 'مصنع الرياض للمعادن يعرض آلة لحام CO2 بـ 500 ر.س./يوم',
    potentialSaving: 'على بُعد 5 كم',
  },
  {
    title: 'فرصة شراء جماعي جديدة',
    description: 'طلب مواد تغليف يحتاج مصنع واحد إضافي لتحقيق الهدف',
    potentialSaving: '18% توفير',
  },
];

const marketTickers = [
  { material: 'الألومنيوم', price: '8,450', change: 2.3, trend: 'up' as const },
  { material: 'الحديد', price: '4,200', change: -0.8, trend: 'down' as const },
  { material: 'النحاس', price: '32,100', change: 1.5, trend: 'up' as const },
];

const sparklineData = [35, 42, 38, 50, 45, 55, 60, 58, 70, 75, 72, 80];

// ============================================================================
// COMPONENTS
// ============================================================================

const glassCardClass = `
  rounded-2xl bg-card/80 dark:bg-card/80 backdrop-blur-xl
  border border-border/50 dark:border-border/50
  shadow-[0_8px_32px_rgba(0,0,0,0.06)]
  hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)]
  hover:-translate-y-0.5 transition-all duration-300
`;

const Sparkline = ({ data, className }: { data: number[]; className?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 80 - 10}`)
    .join(' ');

  return (
    <svg
      className={cn('h-12 w-full', className)}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(87, 87, 87)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(87, 87, 87)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${points} 100,100`} fill="url(#sparkline-fill)" />
      <polyline
        points={points}
        fill="none"
        stroke="rgb(87, 87, 87)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const typeColors = {
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  success: 'bg-foreground',
};

const statusBadgeVariants = {
  collecting: 'info' as const,
  negotiating: 'success' as const,
};

const statusLabels = {
  collecting: 'قيد التجميع',
  negotiating: 'قيد التفاوض',
};

const equipmentStatusConfig = {
  rented: {
    label: 'مؤجر',
    color: 'text-foreground bg-muted dark:bg-muted dark:text-foreground',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  available: {
    label: 'متاح',
    color: 'text-blue-700 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300',
    icon: <Clock className="h-4 w-4" />,
  },
  maintenance: {
    label: 'صيانة',
    color: 'text-amber-700 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300',
    icon: <Cog className="h-4 w-4" />,
  },
};

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<'sourcing' | 'capacity'>('sourcing');

  const totalUrgent = urgentActions.reduce((sum, a) => sum + a.count, 0);
  const totalEquipmentEarnings = myEquipment
    .filter((e) => e.status === 'rented' && e.earnings)
    .reduce((sum, e) => sum + (e.earnings || 0), 0);
  const rentedCount = myEquipment.filter((e) => e.status === 'rented').length;

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* SECTION A: HIGH-PRIORITY HEADER ROW */}
      {/* ================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {/* Card 1: Urgent Actions (col-span-2) */}
        <div className={cn(glassCardClass, 'p-6 lg:col-span-2')}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">إجراءات عاجلة</h3>
            </div>
            <Badge variant="warning">{totalUrgent}</Badge>
          </div>
          <div className="space-y-3">
            {urgentActions.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                className="flex items-center justify-between rounded-xl bg-gray-50/80 p-3 transition-colors hover:bg-gray-100/80 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('h-3 w-3 rounded-full', typeColors[action.type])} />
                  <span className="text-sm text-foreground">{action.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-numbers text-sm font-semibold text-foreground">
                    {action.count}
                  </span>
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Card 2: Financial Impact */}
        <div className={cn(glassCardClass, 'p-6')}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted dark:bg-muted">
              <BarChart3 className="h-5 w-5 text-foreground dark:text-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">الأثر المالي</h3>
          </div>
          <div className="mb-2">
            <p className="font-numbers text-2xl font-bold text-foreground dark:text-foreground">
              {formatCurrency(45000000)}
            </p>
            <p className="text-sm text-muted-foreground">إجمالي التوفير</p>
          </div>
          <Sparkline data={sparklineData} className="mb-3" />
          <div className="flex items-center gap-1 text-sm text-foreground dark:text-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="font-numbers">15%</span>
            <span className="text-muted-foreground">من الشهر الماضي</span>
          </div>
        </div>

        {/* Card 3: Wallet */}
        <div className={cn(glassCardClass, 'p-6')}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
              <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">المحفظة</h3>
          </div>
          <div className="mb-4">
            <p className="font-numbers text-2xl font-bold text-foreground">
              {formatCurrency(12500000)}
            </p>
            <p className="text-sm text-muted-foreground">الرصيد المتاح</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/30">
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <Clock className="h-4 w-4" />
              <span>الفاتورة القادمة:</span>
              <span className="font-numbers font-semibold">{formatCurrency(3500000)}</span>
            </div>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              مستحقة في 2026/02/28
            </p>
          </div>
        </div>
      </motion.div>

      {/* ================================================================== */}
      {/* SECTION B: OPERATIONAL CORE */}
      {/* ================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {/* Operations Hub (col-span-2) */}
        <div className={cn(glassCardClass, 'p-6 lg:col-span-2')}>
          {/* Tab Headers */}
          <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('sourcing')}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'sourcing'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>التوريد (الشراء)</span>
              {activeTab === 'sourcing' && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('capacity')}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'capacity'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Cog className="h-4 w-4" />
              <span>الطاقة (البيع)</span>
              {activeTab === 'capacity' && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'sourcing' ? (
            <div className="space-y-4">
              {activeDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-100/50 dark:border-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800/50"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{deal.title}</h4>
                        <Badge variant={statusBadgeVariants[deal.status]}>
                          {statusLabels[deal.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {deal.participants} • ينتهي {deal.deadline}
                      </p>
                    </div>
                    <div className="text-left">
                      <span className="font-numbers text-lg font-bold text-foreground">
                        {deal.saving}%
                      </span>
                      <p className="text-xs text-muted-foreground">توفير</p>
                    </div>
                  </div>
                  <Progress value={deal.progress} size="sm" />
                </div>
              ))}
              <Link href="/group-buying">
                <Button variant="outline" size="sm" className="w-full">
                  عرض جميع الصفقات
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myEquipment.map((equipment) => {
                const config = equipmentStatusConfig[equipment.status];
                return (
                  <div
                    key={equipment.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-100/50 dark:border-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          config.color
                        )}
                      >
                        {config.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{equipment.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {equipment.status === 'rented' && equipment.renterName
                            ? `${equipment.renterName} • حتى ${equipment.untilDate}`
                            : config.label}
                        </p>
                      </div>
                    </div>
                    {equipment.status === 'rented' && equipment.earnings && (
                      <div className="text-left">
                        <span className="font-numbers font-semibold text-foreground">
                          {formatCurrency(equipment.earnings)}
                        </span>
                        <p className="text-xs text-muted-foreground">إيرادات</p>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Summary Card */}
              <div className="rounded-xl bg-muted p-4 dark:bg-muted">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      إيرادات هذا الشهر
                    </p>
                    <p className="font-numbers text-xl font-bold text-foreground">
                      {formatCurrency(totalEquipmentEarnings)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">معدات مؤجرة</p>
                    <p className="font-numbers text-xl font-bold text-foreground">
                      {rentedCount}
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/capacity-exchange">
                <Button variant="outline" size="sm" className="w-full">
                  إدارة المعدات
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* AI Opportunities Sidebar */}
        <div className="space-y-6">
          {/* Smart Recommendations */}
          <div className={cn(glassCardClass, 'p-6')}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-base font-semibold text-foreground">فرص ذكية لك</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-gradient-to-bl from-purple-50 to-blue-50 p-4 transition-colors hover:from-purple-100 hover:to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50"
                >
                  <div className="mb-2 flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-800">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {rec.potentialSaving}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full">
              اكتشف المزيد
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </div>

          {/* Market Ticker */}
          <div className={cn(glassCardClass, 'p-6')}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-foreground">أسعار السوق</h3>
              </div>
              <div className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/50 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground" />
                </span>
                <span className="text-xs text-muted-foreground">مباشر</span>
              </div>
            </div>
            <div className="space-y-3">
              {marketTickers.map((ticker, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50/80 p-3 dark:bg-gray-800/50"
                >
                  <span className="text-sm font-medium text-foreground">{ticker.material}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-numbers text-sm text-foreground">
                      {ticker.price} ر.س.
                    </span>
                    <div
                      className={cn(
                        'flex items-center gap-0.5 text-xs font-medium',
                        ticker.trend === 'up'
                          ? 'text-foreground'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {ticker.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="font-numbers">{Math.abs(ticker.change)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
