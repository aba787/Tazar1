'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  ShoppingCart,
  Cog,
  Package,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { signOut } from '@/lib/actions/auth';

const pageTitles: Record<string, string> = {
  '/overview': 'لوحة التحكم',
  '/group-buying': 'الشراء الجماعي',
  '/capacity-exchange': 'تبادل الطاقة',
  '/settings': 'الإعدادات',
  '/orders': 'تتبع الطلبات',
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'deal' | 'equipment' | 'system';
  read: boolean;
  createdAt: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'صفقة جديدة متاحة',
    message: 'صفقة ألومنيوم خام بخصم 15% متاحة الآن',
    type: 'deal',
    read: false,
    createdAt: '2026-02-11T10:00:00Z',
  },
  {
    id: '2',
    title: 'تم قبول طلبك',
    message: 'تم قبول طلب حجز ماكينة CNC بنجاح',
    type: 'equipment',
    read: false,
    createdAt: '2026-02-10T14:30:00Z',
  },
  {
    id: '3',
    title: 'تحديث صفقة',
    message: 'تم الوصول للشريحة الفضية في صفقة صفائح الحديد',
    type: 'deal',
    read: false,
    createdAt: '2026-02-09T09:15:00Z',
  },
  {
    id: '4',
    title: 'تذكير بالموعد النهائي',
    message: 'صفقة حبيبات HDPE تنتهي خلال 48 ساعة',
    type: 'system',
    read: true,
    createdAt: '2026-02-08T16:00:00Z',
  },
];

interface HeaderProps {
  onMenuClick: () => void;
  notificationCount?: number;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      setIsSigningOut(false);
      router.push('/login');
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setNotificationsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deal':
        return <ShoppingCart className="h-4 w-4 text-foreground" />;
      case 'equipment':
        return <Cog className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-amber-500" />;
    }
  };

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
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2.5 liquid-button lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

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

        <h2 className="text-base font-semibold sm:hidden">{currentPageTitle}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/group-buying">
          <Button
            size="sm"
            className="hidden sm:flex"
          >
            <Plus className="ml-2 h-4 w-4" />
            إنشاء طلب خاص
          </Button>
          <Button size="icon" className="sm:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>

        <div className="relative" ref={notifRef}>
          <button
            className="relative rounded-xl p-2.5 liquid-button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserMenuOpen(false);
            }}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/20" />
                <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 w-80 liquid-card rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <h3 className="font-semibold text-sm">الإشعارات</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-foreground hover:text-foreground/80 transition-colors"
                    >
                      تحديد الكل كمقروء
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">لا توجد إشعارات</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id)}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-3 text-right hover:bg-foreground/5 transition-colors',
                          !notif.read && 'bg-foreground/[0.02]'
                        )}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn('text-sm', !notif.read ? 'font-semibold' : 'font-medium')}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="h-2 w-2 rounded-full bg-foreground flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {notif.message}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="border-t border-border/50 p-2">
                  <Link
                    href="/settings"
                    className="block text-center text-xs text-muted-foreground hover:text-foreground py-2 transition-colors"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    إعدادات الإشعارات
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotificationsOpen(false);
            }}
            className={cn(
              'flex items-center gap-2 rounded-xl p-2 transition-all',
              'liquid-button',
              userMenuOpen && 'liquid-active'
            )}
          >
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

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 w-56 liquid-card rounded-xl p-2"
              >
                <div className="px-3 py-2 mb-2 border-b border-border/50">
                  <p className="text-sm font-semibold">مصنع النور للألمنيوم</p>
                  <p className="text-xs text-muted-foreground">admin@alnoor.sa</p>
                </div>

                <Link
                  href="/orders"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-foreground/5 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>تتبع الطلبات</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-foreground/5 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>الإعدادات</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  {isSigningOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span>{isSigningOut ? 'جاري الخروج...' : 'تسجيل الخروج'}</span>
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
