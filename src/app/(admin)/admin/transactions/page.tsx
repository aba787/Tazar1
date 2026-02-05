'use client';

import * as React from 'react';
import { CreditCard, Search, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui';
import { getTransactions, updateTransactionStatus } from '@/lib/actions/admin';

interface Transaction {
  id: string;
  source_type: string;
  source_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  description?: string;
  created_at: string;
  factory?: { id: string; name: string };
}

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  paid: 'مدفوع',
  failed: 'فشل',
  refunded: 'مسترد',
  cancelled: 'ملغى',
};

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'info'> = {
  pending: 'warning',
  processing: 'info',
  paid: 'success',
  failed: 'destructive',
  refunded: 'default',
  cancelled: 'destructive',
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    loadTransactions();
  }, [filter]);

  async function loadTransactions() {
    setLoading(true);
    const data = await getTransactions(filter);
    setTransactions(data as Transaction[]);
    setLoading(false);
  }

  async function handleUpdateStatus(id: string, status: 'paid' | 'failed' | 'refunded') {
    const result = await updateTransactionStatus(id, status);
    if (result.success) {
      loadTransactions();
    } else {
      alert(result.error);
    }
  }

  function formatAmount(amount: number) {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount / 100);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const filteredTransactions = transactions.filter(t =>
    t.factory?.name.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المعاملات المالية</h1>
          <p className="text-gray-500 dark:text-gray-400">متابعة وإدارة جميع المعاملات المالية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {transactions.filter(t => t.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-500">قيد الانتظار</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {transactions.filter(t => t.status === 'paid').length}
              </p>
              <p className="text-sm text-gray-500">مدفوع</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {transactions.filter(t => t.status === 'failed').length}
              </p>
              <p className="text-sm text-gray-500">فشل</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatAmount(transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0))}
              </p>
              <p className="text-sm text-gray-500">إجمالي المدفوعات</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            {['all', 'pending', 'paid', 'failed'].map((s) => (
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
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>لا توجد معاملات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">المعاملة</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">المصنع</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">النوع</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-4">
                      <code className="text-xs text-gray-500">{tx.id.slice(0, 8)}...</code>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {tx.factory?.name || '-'}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {tx.source_type === 'deal_participation' ? 'مشاركة صفقة' :
                       tx.source_type === 'equipment_booking' ? 'حجز معدات' :
                       tx.source_type === 'escrow' ? 'ضمان' :
                       tx.source_type === 'refund' ? 'استرداد' : tx.source_type}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusColors[tx.status] || 'default'}>
                        {statusLabels[tx.status] || tx.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      {tx.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(tx.id, 'paid')}
                            className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
                            title="تأكيد الدفع"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(tx.id, 'failed')}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                            title="فشل الدفع"
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      )}
                      {tx.status === 'paid' && (
                        <button
                          onClick={() => handleUpdateStatus(tx.id, 'refunded')}
                          className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30"
                          title="استرداد"
                        >
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
