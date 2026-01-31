'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={`p-2 rounded-lg bg-muted text-muted-foreground ${className || ''}`}
        disabled
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`p-2 rounded-lg transition-colors hover:bg-muted ${className || ''}`}
      title={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </button>
  );
}
