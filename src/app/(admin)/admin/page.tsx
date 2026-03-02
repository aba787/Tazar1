import {
  Factory,
  ShoppingCart,
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { getAdminStats, getPendingFactories } from '@/lib/actions/admin';
import { Badge } from '@/components/ui';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const pendingFactories = await getPendingFactories();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          لوحة التحكم
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          مرحباً بك في لوحة إدارة منصة تآزر
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي المصانع"
          value={stats.totalFactories}
          icon={Factory}
          color="blue"
          subtitle={`${stats.pendingFactories} بانتظار الموافقة`}
        />
        <StatCard
          title="المصانع المعتمدة"
          value={stats.verifiedFactories}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="الصفقات النشطة"
          value={stats.activeDeals}
          icon={ShoppingCart}
          color="amber"
          subtitle={`من ${stats.totalDeals} إجمالي`}
        />
        <StatCard
          title="المعدات المعروضة"
          value={stats.totalEquipment}
          icon={Wrench}
          color="purple"
          subtitle={`${stats.availableEquipment} متاحة`}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickStat
          label="مصانع معتمدة"
          value={stats.verifiedFactories}
          total={stats.totalFactories}
          color="green"
        />
        <QuickStat
          label="مصانع منتظرة"
          value={stats.pendingFactories}
          total={stats.totalFactories}
          color="amber"
        />
        <QuickStat
          label="مصانع مرفوضة"
          value={stats.rejectedFactories}
          total={stats.totalFactories}
          color="red"
        />
      </div>

      {/* Pending Approvals Alert */}
      {pendingFactories.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                {pendingFactories.length} مصنع بانتظار الموافقة
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                يرجى مراجعة طلبات التسجيل والموافقة عليها
              </p>
            </div>
            <Link
              href="/admin/factories?status=submitted"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              مراجعة الطلبات
            </Link>
          </div>
        </div>
      )}

      {/* Recent Pending Factories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            المصانع المنتظرة للموافقة
          </h2>
          <Link
            href="/admin/factories?status=submitted"
            className="text-sm text-foreground font-medium hover:underline"
          >
            عرض الكل
          </Link>
        </div>

        {pendingFactories.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-500" />
            <p>لا توجد طلبات منتظرة</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingFactories.slice(0, 5).map((factory) => (
              <div
                key={factory.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Factory className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {factory.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {factory.city} • {factory.commercial_register}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="warning">
                    <Clock className="h-3 w-3 ml-1" />
                    بانتظار المراجعة
                  </Badge>
                  <Link
                    href={`/admin/factories/${factory.id}`}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    مراجعة
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          href="/admin/factories"
          icon={Factory}
          title="إدارة المصانع"
          description="عرض وإدارة جميع المصانع"
        />
        <QuickActionCard
          href="/admin/deals"
          icon={ShoppingCart}
          title="إدارة الصفقات"
          description="متابعة صفقات الشراء الجماعي"
        />
        <QuickActionCard
          href="/admin/equipment"
          icon={Wrench}
          title="إدارة المعدات"
          description="عرض المعدات المسجلة"
        />
        <QuickActionCard
          href="/admin/settings"
          icon={TrendingUp}
          title="الإعدادات"
          description="إعدادات المنصة"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'purple';
  subtitle?: string;
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green:
      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber:
      'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple:
      'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function QuickStat({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: 'green' | 'amber' | 'red';
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const colors = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {value} / {total}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        {percentage}%
      </p>
    </div>
  );
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500 transition-all group"
    >
      <Icon className="h-8 w-8 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors mb-3" />
      <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </Link>
  );
}
