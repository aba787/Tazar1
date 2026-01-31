import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency (from halala to riyal)
export function formatCurrency(
  amountInHalala: number,
  options?: Intl.NumberFormatOptions
): string {
  const amountInRiyal = amountInHalala / 100;
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amountInRiyal);
}

// Format number with Arabic numerals
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-SA').format(num);
}

// Format percentage
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

// Format date in Arabic
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(d);
}

// Format relative time (e.g., "منذ ٣ أيام")
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat('ar-SA', { numeric: 'auto' });
  
  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 604800) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
}

// Calculate savings percentage
export function calculateSavings(marketPrice: number, groupPrice: number): number {
  if (marketPrice === 0) return 0;
  return Math.round(((marketPrice - groupPrice) / marketPrice) * 100);
}

// Calculate order progress
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Validate Saudi phone number
export function isValidSaudiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Saudi numbers: 05XXXXXXXX or 9665XXXXXXXX
  return /^(05|9665)\d{8}$/.test(cleaned);
}

// Format Saudi phone number
export function formatSaudiPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('966')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
}

// Validate Commercial Registration (10 digits)
export function isValidCR(cr: string): boolean {
  return /^\d{10}$/.test(cr.replace(/\D/g, ''));
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Sleep/delay
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if deadline is approaching (within 3 days)
export function isDeadlineApproaching(deadline: string): boolean {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffInDays = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffInDays <= 3 && diffInDays > 0;
}

// Check if deadline has passed
export function isDeadlinePassed(deadline: string): boolean {
  return new Date(deadline) < new Date();
}
