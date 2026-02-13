'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  LayoutDashboard,
  Factory,
  ShoppingCart,
  Wrench,
  Users,
  Building2,
  FileText,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  Moon,
  Sun,
  Activity,
  CreditCard,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from '@/lib/actions/auth';

const menuItems = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/activity', label: 'النشاط المباشر', icon: Activity },
  { href: '/admin/factories', label: 'المصانع', icon: Factory },
  { href: '/admin/deals', label: 'الصفقات', icon: ShoppingCart },
  { href: '/admin/transactions', label: 'المعاملات', icon: CreditCard },
  { href: '/admin/bank-transfers', label: 'التحويلات البنكية', icon: Building2 },
  { href: '/admin/equipment', label: 'المعدات', icon: Wrench },
  { href: '/admin/users', label: 'المستخدمين', icon: Users },
  { href: '/admin/documents', label: 'الوثائق', icon: FileText },
  { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="fixed right-0 top-0 z-40 w-64 h-screen bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">تآزر</h1>
            <p className="text-xs text-gray-400">لوحة الإدارة</p>
          </div>
        </div>
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-300" />
            )}
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronLeft className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      {/* Back to Dashboard */}
      <div className="p-4 border-t border-gray-800 mt-4">
        <Link
          href="/overview"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5 rotate-180" />
          <span>العودة للوحة المستخدم</span>
        </Link>
      </div>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-400 w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
