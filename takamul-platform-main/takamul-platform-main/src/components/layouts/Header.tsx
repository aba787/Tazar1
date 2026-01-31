'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Bell,
  Plus,
  Settings,
  LogOut,
  ChevronDown,
  User,
  ChevronLeft,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

// Page title mapping
const pageTitles: Record<string, string> = {
  '/overview': 'لوحة التحكم',
  '/group-buying': 'الشراء الجماعي',
  '/capacity-exchange': 'تبادل الطاقة',
  '/settings': 'الإعدادات',
};

interface HeaderProps {
  onMenuClick: () => void;
  notificationCount?: number;
}

export function Header({ onMenuClick, notificationCount = 3 }: HeaderProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current page title
  const currentPageTitle = pageTitles[pathname] || 'لوحة التحكم';

  return (
    <header
      className={cn(
        'sticky top-0 z-30',
        'mx-4 mt-4 lg:mx-0 lg:mt-0 lg:mr-4',
        'rounded-2xl lg:rounded-none lg:rounded-br-2xl lg:rounded-bl-2xl',
        'liquid-header',
        'flex h-16 items-center justify-between px-4 lg:px-6'
      )}
    >
      {/* Left Section: Menu Button (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2.5 liquid-button lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-2 text-sm">
          <Link
            href="/overview"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>الرئيسية</span>
          </Link>
          <ChevronLeft className="h-4 w-4 text-border" />
          <span className="font-medium text-foreground">{currentPageTitle}</span>
        </nav>

        {/* Mobile: Just page title */}
        <h2 className="text-base font-semibold sm:hidden">{currentPageTitle}</h2>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        {/* Create New Order Button */}
        <Link href="/group-buying">
          <Button
            size="sm"
            className="hidden sm:flex"
          >
            <Plus className="ml-2 h-4 w-4" />
            إنشاء طلب جديد
          </Button>
          {/* Mobile: Icon only */}
          <Button size="icon" className="sm:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>

        {/* Notifications */}
        <button className="relative rounded-xl p-2.5 liquid-button">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/20" />
              <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              'flex items-center gap-2 rounded-xl p-2 transition-all',
              'liquid-button',
              userMenuOpen && 'liquid-active'
            )}
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
              <User className="h-4 w-4" />
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                userMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 w-56 liquid-card rounded-xl p-2"
              >
                {/* User Info Header */}
                <div className="px-3 py-2 mb-2 border-b border-border/50">
                  <p className="text-sm font-semibold">مصنع النور للألمنيوم</p>
                  <p className="text-xs text-muted-foreground">admin@alnoor.sa</p>
                </div>

                {/* Menu Items */}
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-foreground/5 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>الإعدادات</span>
                </Link>

                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Header;
