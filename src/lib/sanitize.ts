import { z } from 'zod';

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/[&<>"'`/]/g, (char) => HTML_ENTITY_MAP[char] || char)
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

export function stripHtml(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

export const titleSchema = z.string()
  .min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل')
  .max(120, 'العنوان يجب ألا يتجاوز 120 حرف')
  .transform(sanitizeText);

export const descriptionSchema = z.string()
  .max(2000, 'الوصف يجب ألا يتجاوز 2000 حرف')
  .optional()
  .transform(val => val ? sanitizeText(val) : undefined);

export const notesSchema = z.string()
  .max(1000, 'الملاحظات يجب ألا تتجاوز 1000 حرف')
  .optional()
  .transform(val => val ? sanitizeText(val) : undefined);

export const nameSchema = z.string()
  .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
  .max(200, 'الاسم يجب ألا يتجاوز 200 حرف')
  .transform(sanitizeText);

export const reasonSchema = z.string()
  .min(10, 'السبب يجب أن يكون 10 أحرف على الأقل')
  .max(1000, 'السبب يجب ألا يتجاوز 1000 حرف')
  .transform(sanitizeText);

export const referenceNumberSchema = z.string()
  .min(1, 'رقم المرجع مطلوب')
  .max(100, 'رقم المرجع يجب ألا يتجاوز 100 حرف')
  .transform(sanitizeText);

export const uuidSchema = z.string().uuid('المعرف غير صالح');

export const amountSchema = z.number()
  .positive('المبلغ يجب أن يكون أكبر من صفر')
  .max(100000000, 'المبلغ كبير جداً');

export const quantitySchema = z.number()
  .positive('الكمية يجب أن تكون أكبر من صفر')
  .int('الكمية يجب أن تكون عدد صحيح');
