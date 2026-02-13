'use client';

import * as React from 'react';
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import {
  adminGetTransfers,
  adminUpdateTransferStatus,
  adminGetReceiptUrl,
  type BankTransfer,
} from '@/lib/actions/bank-transfers';

const statusLabels: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'معتمد',
  rejected: 'مرفوض',
};

const statusColors: Record<string, 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

export default function AdminBankTransfersPage() {
  const [transfers, setTransfers] = React.useState<BankTransfer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [receiptModal, setReceiptModal] = React.useState<{ url: string; open: boolean }>({ url: '', open: false });
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadTransfers();
  }, [filter]);

  async function loadTransfers() {
    setLoading(true);
    const data = await adminGetTransfers(filter);
    setTransfers(data);
    setLoading(false);
  }

  async function handleUpdateStatus(id: string, status: 'approved' | 'rejected') {
    setActionLoading(id);
    setError(null);
    setSuccessMsg(null);

    const result = await adminUpdateTransferStatus(id, status);

    if (result.success) {
      setSuccessMsg(result.message || 'تم تحديث الحالة');
      loadTransfers();
    } else {
      setError(result.error || 'حدث خطأ');
    }

    setActionLoading(null);
    setTimeout(() => { setSuccessMsg(null); setError(null); }, 3000);
  }

  async function handleViewReceipt(receiptPath: string) {
    const url = await adminGetReceiptUrl(receiptPath);
    if (url) {
      setReceiptModal({ url, open: true });
    }
  }

  const filteredTransfers = transfers.filter(t =>
    !search ||
    t.sender_name.includes(search) ||
    t.reference_number.includes(search) ||
    t.user_id.includes(search)
  );

  const counts = {
    all: transfers.length,
    pending: transfers.filter(t => t.status === 'pending').length,
    approved: transfers.filter(t => t.status === 'approved').length,
    rejected: transfers.filter(t => t.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="h-7 w-7 text-emerald-600" />
            طلبات التحويل البنكي
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            مراجعة واعتماد طلبات التحويل البنكي
          </p>
        </div>
        <div className="flex items-center gap-2">
          {counts.pending > 0 && (
            <Badge variant="warning">
              {counts.pending} بانتظار المراجعة
            </Badge>
          )}
        </div>
      </div>

      {(error || successMsg) && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          error
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
        }`}>
          {error ? (
            <AlertCircle className="h-5 w-5 text-red-600" />
          ) : (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          )}
          <p className={`text-sm ${error ? 'text-red-600' : 'text-emerald-600'}`}>
            {error || successMsg}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {status === 'all' ? 'الكل' : statusLabels[status]}
              <span className="mr-1 text-xs opacity-60">
                ({counts[status]})
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث باسم المحول أو رقم المرجع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pr-10 pl-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredTransfers.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد طلبات تحويل</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">التاريخ</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">اسم المحول</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">المبلغ</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">رقم المرجع</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">تاريخ التحويل</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الإيصال</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.map((transfer) => (
                  <tr
                    key={transfer.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-4 text-sm">
                      {new Date(transfer.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-4 text-sm font-medium">{transfer.sender_name}</td>
                    <td className="p-4 text-sm font-semibold">
                      {transfer.amount.toLocaleString('ar-SA')} ريال
                    </td>
                    <td className="p-4 text-sm font-mono" dir="ltr">
                      {transfer.reference_number}
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(transfer.transfer_date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-4">
                      <Badge variant={statusColors[transfer.status]}>
                        {statusLabels[transfer.status]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleViewReceipt(transfer.receipt_url)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="عرض الإيصال"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
                    <td className="p-4">
                      {transfer.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(transfer.id, 'approved')}
                            disabled={actionLoading === transfer.id}
                            className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50"
                            title="اعتماد"
                          >
                            {actionLoading === transfer.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(transfer.id, 'rejected')}
                            disabled={actionLoading === transfer.id}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                            title="رفض"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {transfer.reviewed_at &&
                            new Date(transfer.reviewed_at).toLocaleDateString('ar-SA')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {receiptModal.open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setReceiptModal({ url: '', open: false })}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">صورة الإيصال</h3>
              <button
                onClick={() => setReceiptModal({ url: '', open: false })}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            {receiptModal.url.includes('.pdf') ? (
              <iframe
                src={receiptModal.url}
                className="w-full h-[70vh] rounded-lg"
                title="إيصال التحويل"
              />
            ) : (
              <img
                src={receiptModal.url}
                alt="إيصال التحويل"
                className="w-full rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
