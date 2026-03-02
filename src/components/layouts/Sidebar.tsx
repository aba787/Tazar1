'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Cog,
  Settings,
  X,
  Building2,
  Verified,
  LogOut,
  ChevronUp,
  User,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/actions/auth';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    title: 'لوحة التحكم',
    href: '/overview',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'الشراء الجماعي',
    href: '/group-buying',
    icon: <ShoppingCart className="h-5 w-5" />,
    badge: 3,
  },
  {
    title: 'تبادل الطاقة',
    href: '/capacity-exchange',
    icon: <Cog className="h-5 w-5" />,
    badge: 2,
  },
  {
    title: 'التحويل البنكي',
    href: '/bank-transfer',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'الإعدادات',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-80 flex-col',
          'liquid-sidebar',
          'transform transition-transform duration-300 ease-out',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : 'translate-x-full',
          // Desktop: always visible with floating margin
          'lg:translate-x-0 lg:m-4 lg:h-[calc(100vh-2rem)] lg:rounded-2xl'
        )}
      >
        {/* Logo Area */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-border/30">
          <Link href="/overview" className="flex items-center gap-3 group">
            {/* Logo Icon */}
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background transition-transform group-hover:scale-105">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
            {/* Logo Text */}
            <div>
              <h1 className="text-lg font-bold text-foreground">تآزر</h1>
              <p className="text-xs text-muted-foreground">منصة المصانع</p>
            </div>
          </Link>

          {/* Theme Toggle & Mobile Close */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="rounded-xl p-2.5 liquid-button transition-colors"
                title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-foreground" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-xl p-2.5 liquid-button transition-colors lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium',
                  'transition-all duration-200',
                  isActive
                    ? 'liquid-active text-foreground'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                )}
              >
                <span className={cn(
                  'transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      'transition-colors',
                      isActive
                        ? 'bg-foreground/10 text-foreground'
                        : 'liquid-badge'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card with Dropdown */}
        <div className="p-4 border-t border-border/30 relative">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="liquid-card rounded-xl p-4 cursor-pointer hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-sm">
                  م
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  مصنع النور للألمنيوم
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>الرياض</span>
                  <Verified className="h-3.5 w-3.5 text-foreground" />
                </div>
              </div>

              {/* Dropdown Arrow */}
              <ChevronUp className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showUserMenu ? "rotate-180" : ""
              )} />
            </div>
          </div>

          {/* User Dropdown Menu */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full right-4 left-4 mb-2 liquid-card rounded-xl overflow-hidden shadow-lg border border-border/30"
              >
                <Link
                  href="/settings"
                  onClick={() => {
                    setShowUserMenu(false);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>الملف الشخصي</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => {
                    setShowUserMenu(false);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>الإعدادات</span>
                </Link>
                <div className="border-t border-border/30" />
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isSigningOut ? 'جاري الخروج...' : 'تسجيل الخروج'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
