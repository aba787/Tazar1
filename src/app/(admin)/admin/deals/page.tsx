'use client';

import * as React from 'react';
import { ShoppingCart, Search, X, AlertTriangle, Eye, Ban } from 'lucide-react';
import { Badge } from '@/components/ui';
import { getDeals, adminCancelDeal } from '@/lib/actions/admin';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  status: string;
  material_type: string;
  min_quantity: number;
  current_quantity: number;
  unit: string;
  created_at: string;
  aggregation_deadline?: string;
  creator?: { name: string; city: string };
  participations?: { count: number }[];
}

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  open: 'مفتوحة',
  aggregating: 'جاري التجميع',
  pending_commitment: 'انتظار الالتزام',
  rfq_open: 'طلب عروض أسعار',
  evaluating_bids: 'تقييم العروض',
  awarded: 'تم الترسية',
  in_production: 'قيد التصنيع',
  shipping: 'قيد الشحن',
  delivered: 'تم التسليم',
  completed: 'مكتملة',
  cancelled: 'ملغية',
};

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'info'> = {
  draft: 'default',
  open: 'info',
  aggregating: 'warning',
  cancelled: 'destructive',
  completed: 'success',
};

export default function AdminDealsPage() {
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [cancelModal, setCancelModal] = React.useState<{ id: string; title: string } | null>(null);
  const [cancelReason, setCancelReason] = React.useState('');
  const [cancelling, setCancelling] = React.useState(false);

  React.useEffect(() => {
    loadDeals();
  }, [filter]);

  async function loadDeals() {
    setLoading(true);
    const data = await getDeals(filter);
    setDeals(data as Deal[]);
    setLoading(false);
  }

  async function handleCancel() {
    if (!cancelModal || !cancelReason || cancelReason.length < 10) return;

    setCancelling(true);
    const result = await adminCancelDeal(cancelModal.id, cancelReason);
    setCancelling(false);

    if (result.success) {
      setCancelModal(null);
      setCancelReason('');
      loadDeals();
    } else {
      alert(result.error);
    }
  }

  const filteredDeals = deals.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.creator?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الصفقات</h1>
          <p className="text-gray-500 dark:text-gray-400">متابعة وإدارة جميع صفقات الشراء الجماعي</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            {['all', 'open', 'aggregating', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === s
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {s === 'all' ? 'الكل' : statusLabels[s]}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 pl-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
        ) : filteredDeals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>لا توجد صفقات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">الصفقة</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">المنشئ</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">الكمية</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">المشاركين</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{deal.title}</p>
                        <p className="text-sm text-gray-500">{deal.material_type}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {deal.creator?.name || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {deal.current_quantity} / {deal.min_quantity} {deal.unit}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {deal.participations?.[0]?.count || 0}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusColors[deal.status] || 'default'}>
                        {statusLabels[deal.status] || deal.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/group-buying/${deal.id}`}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="عرض"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Link>
                        {!['completed', 'cancelled'].includes(deal.status) && (
                          <button
                            onClick={() => setCancelModal({ id: deal.id, title: deal.title })}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                            title="إلغاء"
                          >
                            <Ban className="h-4 w-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">إلغاء الصفقة</h3>
                <p className="text-sm text-gray-500">{cancelModal.title}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              هل أنت متأكد من إلغاء هذه الصفقة؟ لا يمكن التراجع عن هذا الإجراء.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="سبب الإلغاء (10 أحرف على الأقل)..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm mb-4 focus:ring-2 focus:ring-red-500"
              rows={3}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setCancelModal(null);
                  setCancelReason('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                إلغاء
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelReason.length < 10 || cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
