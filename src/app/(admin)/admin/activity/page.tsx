import { Activity, Factory, ShoppingCart, Users, Shield, RefreshCw } from 'lucide-react';
import { getLiveActivityFeed } from '@/lib/actions/admin';
import { Badge } from '@/components/ui';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminActivityPage() {
  const activities = await getLiveActivityFeed(50);

  const typeIcons = {
    factory: Factory,
    deal: ShoppingCart,
    participation: Users,
    admin: Shield,
  };

  const typeColors = {
    factory: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    deal: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    participation: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    admin: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">سجل النشاط</h1>
          <p className="text-gray-500 dark:text-gray-400">متابعة جميع الأنشطة على المنصة لحظياً</p>
        </div>
        <Link
          href="/admin/activity"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Factory className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.type === 'factory').length}
              </p>
              <p className="text-sm text-gray-500">مصانع جديدة</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.type === 'deal').length}
              </p>
              <p className="text-sm text-gray-500">صفقات</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.type === 'participation').length}
              </p>
              <p className="text-sm text-gray-500">مشاركات</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.type === 'admin').length}
              </p>
              <p className="text-sm text-gray-500">إجراءات إدارية</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <Activity className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">النشاط المباشر</h2>
          <Badge variant="success">مباشر</Badge>
        </div>

        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>لا يوجد نشاط حديث</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((activity) => {
              const Icon = typeIcons[activity.type];
              const colorClass = typeColors[activity.type];

              return (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{formatTime(activity.timestamp)}</span>
                      <Badge variant={
                        activity.status === 'verified' || activity.status === 'completed' ? 'success' :
                        activity.status === 'submitted' || activity.status === 'pending' ? 'warning' :
                        activity.status === 'cancelled' || activity.status === 'rejected' ? 'destructive' :
                        'default'
                      } className="text-xs">
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
