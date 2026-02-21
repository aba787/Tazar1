'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Cog,
  RefreshCw,
  ChevronDown,
  Circle,
  Zap,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import type { OrderItem } from '@/lib/actions/orders';

type OrderStatus = 'pending' | 'active' | 'completed' | 'cancelled';
type OrderType = 'group_buying' | 'capacity_exchange';

const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string; badgeVariant: 'warning' | 'success' | 'destructive' | 'default' }> = {
  pending: {
    label: 'قيد الانتظار',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-amber-600 bg-amber-50',
    badgeVariant: 'warning',
  },
  active: {
    label: 'نشط',
    icon: <Zap className="h-4 w-4" />,
    color: 'text-blue-600 bg-blue-50',
    badgeVariant: 'default',
  },
  completed: {
    label: 'مكتمل',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-emerald-600 bg-emerald-50',
    badgeVariant: 'success',
  },
  cancelled: {
    label: 'ملغي',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600 bg-red-50',
    badgeVariant: 'destructive',
  },
};

const typeConfig: Record<OrderType, { label: string; icon: React.ReactNode }> = {
  group_buying: { label: 'شراء جماعي', icon: <ShoppingCart className="h-4 w-4" /> },
  capacity_exchange: { label: 'تبادل طاقة', icon: <Cog className="h-4 w-4" /> },
};

type StatusFilterType = 'all' | OrderStatus;
type TypeFilterType = 'all' | OrderType;

function OrderTimeline({ timeline }: { timeline: OrderItem['timeline'] }) {
  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {timeline.map((step, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center min-w-[80px]">
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors',
                step.completed
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              )}>
                {step.completed ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
              <span className={cn(
                'text-[10px] mt-1 text-center leading-tight',
                step.completed ? 'text-emerald-700 font-medium' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
            {i < timeline.length - 1 && (
              <div className={cn(
                'h-0.5 flex-1 min-w-[20px] -mt-4',
                step.completed ? 'bg-emerald-500' : 'bg-gray-200'
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsRefreshing(true);
      const { getUserOrders } = await import('@/lib/actions/orders');
      const data = await getUserOrders();
      setOrders(data);
    } catch {
      console.error('Failed to fetch orders');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => o.status === 'active').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">تتبع الطلبات</h1>
          <p className="text-muted-foreground">
            متابعة جميع طلبات الشراء الجماعي وتبادل الطاقة الإنتاجية
          </p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={isRefreshing}>
          <RefreshCw className={cn("ml-2 h-4 w-4", isRefreshing && "animate-spin")} />
          تحديث
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending + stats.active}</p>
              <p className="text-sm text-muted-foreground">نشط / قيد الانتظار</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">مكتمل</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
              <p className="text-sm text-muted-foreground">ملغي</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center ml-2">الحالة:</span>
            {([
              { label: 'الكل', value: 'all' },
              { label: 'قيد الانتظار', value: 'pending' },
              { label: 'نشط', value: 'active' },
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
                    : 'bg-muted text-muted-foreground hover:bg-accent'
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
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredOrders.map((order, index) => {
            const sConfig = statusConfig[order.status];
            const tConfig = typeConfig[order.type];
            const isExpanded = expandedOrder === order.id;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className={cn('p-5 hover:shadow-md transition-all cursor-pointer', isExpanded && 'ring-1 ring-border')}
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
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
                          {order.quantity && <span>{order.quantity}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{order.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                      {order.amount > 0 && (
                        <p className="font-numbers text-lg font-bold text-foreground">
                          {formatCurrency(order.amount)}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.updatedAt).toLocaleDateString('ar-SA')}
                        </p>
                        <ChevronDown className={cn('h-4 w-4 transition-transform text-muted-foreground', isExpanded && 'rotate-180')} />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && order.timeline && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <OrderTimeline timeline={order.timeline} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-xl font-semibold">
            {orders.length === 0 ? 'لا توجد طلبات بعد' : 'لا توجد طلبات تطابق البحث'}
          </h3>
          <p className="mt-2 text-muted-foreground">
            {orders.length === 0
              ? 'ابدأ بالانضمام لصفقة شراء جماعي أو إرسال طلب تبادل طاقة'
              : 'جرب تغيير معايير البحث'
            }
          </p>
          {orders.length === 0 && (
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
          )}
        </Card>
      )}
    </div>
  );
}
