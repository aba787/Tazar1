'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Cog,
  ArrowLeft,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

type OrderStatus = 'pending' | 'completed' | 'cancelled';
type OrderType = 'group_buying' | 'capacity_exchange';

interface Order {
  id: string;
  title: string;
  type: OrderType;
  status: OrderStatus;
  amount: number;
  quantity?: string;
  createdAt: string;
  updatedAt: string;
  details: string;
}

const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string; badgeVariant: 'warning' | 'success' | 'destructive' }> = {
  pending: {
    label: 'قيد الانتظار',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300',
    badgeVariant: 'warning',
  },
  completed: {
    label: 'مكتمل',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300',
    badgeVariant: 'success',
  },
  cancelled: {
    label: 'ملغي',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300',
    badgeVariant: 'destructive',
  },
};

const typeConfig: Record<OrderType, { label: string; icon: React.ReactNode }> = {
  group_buying: { label: 'شراء جماعي', icon: <ShoppingCart className="h-4 w-4" /> },
  capacity_exchange: { label: 'تبادل طاقة', icon: <Cog className="h-4 w-4" /> },
};

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    title: 'ألومنيوم خام 6061 - دفعة الربع الأول',
    type: 'group_buying',
    status: 'pending',
    amount: 4675000,
    quantity: '85 طن',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
    details: 'مشاركة في صفقة شراء جماعي للألومنيوم الخام',
  },
  {
    id: 'ORD-002',
    title: 'حجز ماكينة CNC خمس محاور',
    type: 'capacity_exchange',
    status: 'completed',
    amount: 150000,
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-01-25T16:00:00Z',
    details: 'حجز وردية كاملة لماكينة CNC من مصنع التقنية المتقدمة',
  },
  {
    id: 'ORD-003',
    title: 'صفائح حديد مجلفن بالغمس الساخن',
    type: 'group_buying',
    status: 'completed',
    amount: 3990000,
    quantity: '120 طن',
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-01-28T10:00:00Z',
    details: 'شراء جماعي لصفائح حديد مجلفنة',
  },
  {
    id: 'ORD-004',
    title: 'طلب عرض سعر - خط لحام روبوتي',
    type: 'capacity_exchange',
    status: 'pending',
    amount: 1500000,
    createdAt: '2026-02-05T13:00:00Z',
    updatedAt: '2026-02-08T09:00:00Z',
    details: 'طلب عرض سعر لمشروع لحام كامل من مصنع النجوم',
  },
  {
    id: 'ORD-005',
    title: 'حبيبات بلاستيك HDPE للقولبة',
    type: 'group_buying',
    status: 'cancelled',
    amount: 680000,
    quantity: '55 طن',
    createdAt: '2026-01-02T08:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z',
    details: 'تم إلغاء المشاركة بسبب تغيير في الاحتياج',
  },
  {
    id: 'ORD-006',
    title: 'مواد تغليف صناعية متعددة الطبقات',
    type: 'group_buying',
    status: 'pending',
    amount: 1200000,
    quantity: '10,000 وحدة',
    createdAt: '2026-02-10T07:00:00Z',
    updatedAt: '2026-02-11T08:00:00Z',
    details: 'مشاركة في صفقة مواد تغليف صناعية',
  },
];

type StatusFilterType = 'all' | OrderStatus;
type TypeFilterType = 'all' | OrderType;

const glassCardClass = `
  rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
  border border-gray-200/50 dark:border-gray-700/50
  shadow-[0_8px_32px_rgba(0,0,0,0.06)]
`;

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredOrders = mockOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    completed: mockOrders.filter(o => o.status === 'completed').length,
    cancelled: mockOrders.filter(o => o.status === 'cancelled').length,
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">تتبع الطلبات</h1>
          <p className="text-muted-foreground">
            متابعة جميع طلبات الشراء الجماعي وتبادل الطاقة الإنتاجية
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn("ml-2 h-4 w-4", isRefreshing && "animate-spin")} />
          تحديث
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">قيد الانتظار</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">مكتمل</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/50">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
              <p className="text-sm text-muted-foreground">ملغي</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={cn(glassCardClass, 'p-4')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center ml-2">الحالة:</span>
            {([
              { label: 'الكل', value: 'all' },
              { label: 'قيد الانتظار', value: 'pending' },
              { label: 'مكتمل', value: 'completed' },
              { label: 'ملغي', value: 'cancelled' },
            ] as { label: string; value: StatusFilterType }[]).map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  statusFilter === filter.value
                    ? 'bg-foreground text-background'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center ml-2">النوع:</span>
            {([
              { label: 'الكل', value: 'all' },
              { label: 'شراء جماعي', value: 'group_buying' },
              { label: 'تبادل طاقة', value: 'capacity_exchange' },
            ] as { label: string; value: TypeFilterType }[]).map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTypeFilter(filter.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  typeFilter === filter.value
                    ? 'bg-foreground text-background'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order, index) => {
          const sConfig = statusConfig[order.status];
          const tConfig = typeConfig[order.type];
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(glassCardClass, 'p-5 hover:shadow-lg transition-all')}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0', sConfig.color)}>
                    {sConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-foreground">{order.title}</h3>
                      <Badge variant={sConfig.badgeVariant}>{sConfig.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        {tConfig.icon}
                        {tConfig.label}
                      </span>
                      <span>#{order.id}</span>
                      {order.quantity && <span>{order.quantity}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{order.details}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <p className="font-numbers text-lg font-bold text-foreground">
                    {formatCurrency(order.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    آخر تحديث: {new Date(order.updatedAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className={cn(glassCardClass, 'p-12 text-center')}>
          <Package className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-xl font-semibold">لا توجد طلبات</h3>
          <p className="mt-2 text-muted-foreground">
            لم يتم العثور على طلبات تطابق معايير البحث
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/group-buying">
              <Button variant="outline">
                <ShoppingCart className="ml-2 h-4 w-4" />
                الشراء الجماعي
              </Button>
            </Link>
            <Link href="/capacity-exchange">
              <Button variant="outline">
                <Cog className="ml-2 h-4 w-4" />
                تبادل الطاقة
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
