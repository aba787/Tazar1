'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from './admin';
import { sanitizeText } from '@/lib/sanitize';
import { checkRateLimit, adminRateLimitConfig } from '@/lib/rate-limit';

export interface BankTransferResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface BankTransfer {
  id: string;
  user_id: string;
  amount: number;
  sender_name: string;
  reference_number: string;
  transfer_date: string;
  receipt_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  user_email?: string;
}

export async function createBankTransfer(data: {
  amount: number;
  senderName: string;
  referenceNumber: string;
  transferDate: string;
  receiptPath: string;
}): Promise<BankTransferResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' };
  }

  if (!data.amount || data.amount <= 0) {
    return { success: false, error: 'المبلغ غير صحيح' };
  }

  if (!data.senderName?.trim()) {
    return { success: false, error: 'اسم المحول مطلوب' };
  }

  if (!data.referenceNumber?.trim()) {
    return { success: false, error: 'رقم العملية مطلوب' };
  }

  if (!data.transferDate) {
    return { success: false, error: 'تاريخ التحويل مطلوب' };
  }

  if (!data.receiptPath) {
    return { success: false, error: 'صورة الإيصال مطلوبة' };
  }

  const { error } = await supabase
    .from('bank_transfers')
    .insert({
      user_id: user.id,
      amount: data.amount,
      sender_name: sanitizeText(data.senderName.trim().slice(0, 200)),
      reference_number: sanitizeText(data.referenceNumber.trim().slice(0, 100)),
      transfer_date: data.transferDate,
      receipt_url: data.receiptPath,
      status: 'pending',
    });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'لديك طلب تحويل قيد المراجعة بالفعل. يرجى الانتظار حتى تتم مراجعته' };
    }
    return { success: false, error: 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى' };
  }

  revalidatePath('/bank-transfer');
  return { success: true, message: 'تم استلام طلبك وسيتم مراجعته خلال 24 ساعة' };
}

export async function getUserTransfers(): Promise<BankTransfer[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('bank_transfers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (data || []) as BankTransfer[];
}

export async function getReceiptSignedUrl(receiptPath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.storage
    .from('bank-receipts')
    .createSignedUrl(receiptPath, 900);

  return data?.signedUrl || null;
}

export async function adminGetTransfers(statusFilter?: string): Promise<BankTransfer[]> {
  const admin = await isAdmin();
  if (!admin) return [];

  const supabase = await createClient();

  let query = supabase
    .from('bank_transfers')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data } = await query;

  return (data || []) as BankTransfer[];
}

export async function adminUpdateTransferStatus(
  transferId: string,
  status: 'approved' | 'rejected',
  adminNote?: string
): Promise<BankTransferResult> {
  const admin = await isAdmin();
  if (!admin) {
    return { success: false, error: 'غير مصرح' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const rl = await checkRateLimit(`admin:${user.id}`, adminRateLimitConfig);
    if (!rl.allowed) {
      return { success: false, error: 'تم تجاوز عدد المحاولات. حاول لاحقاً' };
    }
  }

  const { data: transfer } = await supabase
    .from('bank_transfers')
    .select('user_id')
    .eq('id', transferId)
    .single();

  if (!transfer) {
    return { success: false, error: 'لم يتم العثور على طلب التحويل' };
  }

  const { error } = await supabase
    .from('bank_transfers')
    .update({
      status,
      admin_note: adminNote ? sanitizeText(adminNote.slice(0, 1000)) : null,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', transferId);

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء تحديث الحالة' };
  }

  await supabase.from('admin_logs').insert({
    admin_id: user?.id,
    action: status === 'approved' ? 'approve_transfer' : 'reject_transfer',
    target_type: 'bank_transfer',
    target_id: transferId,
    details: { status, admin_note: adminNote || null },
  });

  if (status === 'approved') {
    const { data: existingFactory } = await supabase
      .from('factories')
      .select('id')
      .eq('user_id', transfer.user_id)
      .maybeSingle();

    if (existingFactory) {
      await supabase
        .from('factories')
        .update({ status: 'active', verified: true })
        .eq('id', existingFactory.id);
    }
  }

  revalidatePath('/admin/bank-transfers');
  return {
    success: true,
    message: status === 'approved' ? 'تم اعتماد التحويل وتفعيل الحساب بنجاح' : 'تم رفض التحويل',
  };
}

export async function adminGetReceiptUrl(receiptPath: string): Promise<string | null> {
  const admin = await isAdmin();
  if (!admin) return null;

  const supabase = await createClient();

  const { data } = await supabase.storage
    .from('bank-receipts')
    .createSignedUrl(receiptPath, 900);

  return data?.signedUrl || null;
}
