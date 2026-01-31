'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Factory,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { getFactories } from '@/lib/actions/admin';
import { Badge } from '@/components/ui';
import Link from 'next/link';

interface FactoryData {
  id: string;
  name: string;
  commercial_register: string;
  city: string;
  contact_email: string;
  onboarding_status: string;
  created_at: string;
  documents: { count: number }[];
  capabilities: { count: number }[];
}

export default function FactoriesPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';

  const [factories, setFactories] = useState<FactoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFactories();
  }, [statusFilter]);

  async function loadFactories() {
    setLoading(true);
    const data = await getFactories(statusFilter === 'all' ? undefined : statusFilter);
    setFactories(data || []);
    setLoading(false);
  }

  const filteredFactories = factories.filter(
    (f) =>
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.commercial_register?.includes(search)
  );

  const statusOptions = [
    { value: 'all', label: 'الكل', count: factories.length },
    {
      value: 'submitted',
      label: 'بانتظار الموافقة',
      count: factories.filter((f) => f.onboarding_status === 'submitted').length,
    },
    {
      value: 'verified',
      label: 'معتمد',
      count: factories.filter((f) => f.onboarding_status === 'verified').length,
    },
    {
      value: 'rejected',
      label: 'مرفوض',
      count: factories.filter((f) => f.onboarding_status === 'rejected').length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إدارة المصانع
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            عرض وإدارة المصانع المسجلة
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث باسم المصنع أو السجل التجاري..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pr-10 pl-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((option) => (
              <Link
                key={option.value}
                href={`/admin/factories${option.value !== 'all' ? `?status=${option.value}` : ''}`}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    statusFilter === option.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  المصنع
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  السجل التجاري
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  المدينة
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  الحالة
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  التاريخ
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      جاري التحميل...
                    </div>
                  </td>
                </tr>
              ) : filteredFactories.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    لا توجد مصانع
                  </td>
                </tr>
              ) : (
                filteredFactories.map((factory) => (
                  <tr
                    key={factory.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <Factory className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {factory.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {factory.contact_email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">
                      {factory.commercial_register}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {factory.city}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={factory.onboarding_status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(factory.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/factories/${factory.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {!loading && filteredFactories.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          عرض {filteredFactories.length} من {factories.length} مصنع
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    {
      label: string;
      variant: 'success' | 'warning' | 'destructive' | 'secondary';
      icon: React.ElementType;
    }
  > = {
    pending: { label: 'جديد', variant: 'secondary', icon: Clock },
    in_progress: { label: 'قيد التسجيل', variant: 'secondary', icon: Clock },
    submitted: { label: 'بانتظار الموافقة', variant: 'warning', icon: Clock },
    verified: { label: 'معتمد', variant: 'success', icon: CheckCircle },
    rejected: { label: 'مرفوض', variant: 'destructive', icon: XCircle },
  };

  const { label, variant, icon: Icon } =
    config[status] || config.pending;

  return (
    <Badge variant={variant} className="inline-flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
