'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sanitizeText } from '@/lib/sanitize';
import { checkRateLimit, adminRateLimitConfig } from '@/lib/rate-limit';

export type UserRole = 'user' | 'admin' | 'super_admin' | 'moderator';

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .in('role', ['admin', 'super_admin'])
    .maybeSingle();

  return !!roleData;
}

export async function isSuperAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .eq('role', 'super_admin')
    .maybeSingle();

  return !!roleData;
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('role', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.role as UserRole || null;
}

export async function grantRole(
  targetUserId: string, 
  role: UserRole,
  expiresAt?: Date
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'غير مصرح' };
  }

  const isSuperAdminUser = await isSuperAdmin();
  if (!isSuperAdminUser) {
    return { success: false, error: 'غير مصرح - يجب أن تكون مسؤولاً متميزاً' };
  }

  const rl = await checkRateLimit(`admin:${user.id}`, adminRateLimitConfig);
  if (!rl.allowed) {
    return { success: false, error: 'تم تجاوز عدد المحاولات. حاول لاحقاً' };
  }

  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: targetUserId,
      role,
      granted_by: user.id,
      expires_at: expiresAt?.toISOString() || null,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'grant_role',
    target_type: 'user',
    target_id: targetUserId,
    details: { role, expires_at: expiresAt?.toISOString() },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function revokeRole(
  targetUserId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'غير مصرح' };
  }

  const isSuperAdminUser = await isSuperAdmin();
  if (!isSuperAdminUser) {
    return { success: false, error: 'غير مصرح - يجب أن تكون مسؤولاً متميزاً' };
  }

  const rl = await checkRateLimit(`admin:${user.id}`, adminRateLimitConfig);
  if (!rl.allowed) {
    return { success: false, error: 'تم تجاوز عدد المحاولات. حاول لاحقاً' };
  }

  const { error } = await supabase
    .from('user_roles')
    .update({ is_active: false })
    .eq('user_id', targetUserId)
    .eq('role', role)
    .eq('is_active', true);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'revoke_role',
    target_type: 'user',
    target_id: targetUserId,
    details: { role },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function getAdminStats() {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return {
      totalFactories: 0,
      pendingFactories: 0,
      verifiedFactories: 0,
      rejectedFactories: 0,
      totalDeals: 0,
      activeDeals: 0,
      totalEquipment: 0,
      availableEquipment: 0,
    };
  }

  const supabase = await createClient();

  const [
    { count: totalFactories },
    { count: pendingFactories },
    { count: verifiedFactories },
    { count: rejectedFactories },
    { count: totalDeals },
    { count: activeDeals },
    { count: totalEquipment },
    { count: availableEquipment },
  ] = await Promise.all([
    supabase.from('factories').select('*', { count: 'exact', head: true }),
    supabase.from('factories').select('*', { count: 'exact', head: true }).eq('onboarding_status', 'submitted'),
    supabase.from('factories').select('*', { count: 'exact', head: true }).eq('onboarding_status', 'verified'),
    supabase.from('factories').select('*', { count: 'exact', head: true }).eq('onboarding_status', 'rejected'),
    supabase.from('procurement_deals').select('*', { count: 'exact', head: true }),
    supabase.from('procurement_deals').select('*', { count: 'exact', head: true }).in('status', ['open', 'aggregating', 'rfq_open']),
    supabase.from('equipment').select('*', { count: 'exact', head: true }),
    supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'available'),
  ]);

  return {
    totalFactories: totalFactories || 0,
    pendingFactories: pendingFactories || 0,
    verifiedFactories: verifiedFactories || 0,
    rejectedFactories: rejectedFactories || 0,
    totalDeals: totalDeals || 0,
    activeDeals: activeDeals || 0,
    totalEquipment: totalEquipment || 0,
    availableEquipment: availableEquipment || 0,
  };
}

export async function getPendingFactories() {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return [];
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from('factories')
    .select(`
      *,
      documents:factory_documents(*),
      capabilities:factory_capabilities(*)
    `)
    .eq('onboarding_status', 'submitted')
    .order('submitted_at', { ascending: true });

  return data || [];
}

export async function getFactories(status?: string) {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return [];
  }

  const supabase = await createClient();

  let query = supabase
    .from('factories')
    .select(`
      *,
      documents:factory_documents(count),
      capabilities:factory_capabilities(count)
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('onboarding_status', status);
  }

  const { data } = await query;
  return data || [];
}

export async function getFactoryDetails(factoryId: string) {
  if (!factoryId || typeof factoryId !== 'string') {
    return null;
  }

  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return null;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from('factories')
    .select(`
      *,
      documents:factory_documents(*),
      capabilities:factory_capabilities(*)
    `)
    .eq('id', factoryId)
    .single();

  return data;
}

export async function approveFactory(factoryId: string) {
  if (!factoryId || typeof factoryId !== 'string') {
    return { success: false, error: 'معرف المصنع غير صالح' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'غير مصرح' };
  }

  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return { success: false, error: 'غير مصرح' };
  }

  const { error } = await supabase
    .from('factories')
    .update({
      onboarding_status: 'verified',
      status: 'verified',
      verified_at: new Date().toISOString(),
      verified_by: user.id,
    })
    .eq('id', factoryId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'approve_factory',
    target_type: 'factory',
    target_id: factoryId,
  });

  revalidatePath('/admin/factories');
  revalidatePath('/admin');

  return { success: true };
}

export async function rejectFactory(factoryId: string, reason: string) {
  if (!factoryId || typeof factoryId !== 'string') {
    return { success: false, error: 'معرف المصنع غير صالح' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'غير مصرح' };
  }

  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return { success: false, error: 'غير مصرح' };
  }

  if (!reason || reason.trim().length < 10) {
    return { success: false, error: 'يجب تقديم سبب الرفض (10 أحرف على الأقل)' };
  }

  const sanitizedReason = sanitizeText(reason.trim().slice(0, 1000));

  const { error } = await supabase
    .from('factories')
    .update({
      onboarding_status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: sanitizedReason,
    })
    .eq('id', factoryId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'reject_factory',
    target_type: 'factory',
    target_id: factoryId,
    details: { reason: sanitizedReason },
  });

  revalidatePath('/admin/factories');
  revalidatePath('/admin');

  return { success: true };
}

export async function suspendFactory(factoryId: string, reason: string) {
  if (!factoryId || typeof factoryId !== 'string') {
    return { success: false, error: 'معرف المصنع غير صالح' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'غير مصرح' };
  }

  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return { success: false, error: 'غير مصرح' };
  }

  if (!reason || reason.trim().length < 10) {
    return { success: false, error: 'يجب تقديم سبب الإيقاف (10 أحرف على الأقل)' };
  }

  const sanitizedReason = sanitizeText(reason.trim().slice(0, 1000));

  const { error } = await supabase
    .from('factories')
    .update({
      status: 'suspended',
      suspension_reason: sanitizedReason,
      suspended_at: new Date().toISOString(),
    })
    .eq('id', factoryId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'suspend_factory',
    target_type: 'factory',
    target_id: factoryId,
    details: { reason: sanitizedReason },
  });

  revalidatePath('/admin/factories');

  return { success: true };
}

export async function getDeals(status?: string) {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return [];
  }

  const supabase = await createClient();

  let query = supabase
    .from('procurement_deals')
    .select(`
      *,
      creator:factories!creator_factory_id(name, city),
      participations:deal_participations(count)
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data } = await query;
  return data || [];
}

export async function getEquipment() {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return [];
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from('equipment')
    .select(`
      *,
      factory:factories(name, city)
    `)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function getAdminLogs(limit: number = 50) {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return [];
  }

  const safeLimit = Math.min(Math.max(1, limit), 100);
  
  const supabase = await createClient();

  const { data } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  return data || [];
}

export async function getCurrentAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return null;
  }

  return user;
}

export async function adminCancelDeal(dealId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  if (!dealId) {
    return { success: false, error: 'معرف الصفقة مطلوب' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'غير مصرح' };
  }

  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return { success: false, error: 'غير مصرح' };
  }

  if (!reason || reason.trim().length < 10) {
    return { success: false, error: 'يجب تقديم سبب الإلغاء (10 أحرف على الأقل)' };
  }

  const { data: deal } = await supabase
    .from('procurement_deals')
    .select('status')
    .eq('id', dealId)
    .single();

  if (!deal) {
    return { success: false, error: 'الصفقة غير موجودة' };
  }

  const nonCancellableStatuses = ['completed', 'cancelled'];
  if (nonCancellableStatuses.includes(deal.status)) {
    return { success: false, error: 'لا يمكن إلغاء هذه الصفقة' };
  }

  const { error } = await supabase
    .from('procurement_deals')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', dealId);

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء إلغاء الصفقة' };
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'cancel_deal',
    target_type: 'deal',
    target_id: dealId,
    details: { reason: reason.trim(), previous_status: deal.status },
  });

  revalidatePath('/admin/deals');
  return { success: true };
}

export async function adminPauseDeal(dealId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  if (!dealId) {
    return { success: false, error: 'معرف الصفقة مطلوب' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'غير مصرح' };
  }

  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return { success: false, error: 'غير مصرح' };
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'pause_deal',
    target_type: 'deal',
    target_id: dealId,
    details: { reason: reason.trim() },
  });

  revalidatePath('/admin/deals');
  return { success: true };
}

export async function getLiveActivityFeed(limit: number = 20) {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return [];
  }

  const safeLimit = Math.min(Math.max(1, limit), 50);
  
  const supabase = await createClient();

  const [
    { data: recentFactories },
    { data: recentDeals },
    { data: recentParticipations },
    { data: recentLogs },
  ] = await Promise.all([
    supabase
      .from('factories')
      .select('id, name, created_at, onboarding_status')
      .order('created_at', { ascending: false })
      .limit(safeLimit),
    supabase
      .from('procurement_deals')
      .select('id, title, created_at, status, creator_factory_id')
      .order('created_at', { ascending: false })
      .limit(safeLimit),
    supabase
      .from('deal_participations')
      .select('id, deal_id, factory_id, joined_at, status')
      .order('joined_at', { ascending: false })
      .limit(safeLimit),
    supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(safeLimit),
  ]);

  const activities: Array<{
    type: 'factory' | 'deal' | 'participation' | 'admin';
    id: string;
    title: string;
    timestamp: string;
    status: string;
    details?: Record<string, unknown>;
  }> = [];

  (recentFactories || []).forEach(f => {
    activities.push({
      type: 'factory',
      id: f.id,
      title: `مصنع جديد: ${f.name}`,
      timestamp: f.created_at,
      status: f.onboarding_status,
    });
  });

  (recentDeals || []).forEach(d => {
    activities.push({
      type: 'deal',
      id: d.id,
      title: `صفقة: ${d.title}`,
      timestamp: d.created_at,
      status: d.status,
    });
  });

  (recentParticipations || []).forEach(p => {
    activities.push({
      type: 'participation',
      id: p.id,
      title: `مشاركة في صفقة`,
      timestamp: p.joined_at,
      status: p.status,
      details: { deal_id: p.deal_id, factory_id: p.factory_id },
    });
  });

  (recentLogs || []).forEach(l => {
    activities.push({
      type: 'admin',
      id: l.id,
      title: `إجراء إداري: ${l.action}`,
      timestamp: l.created_at,
      status: 'completed',
      details: l.details,
    });
  });

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, safeLimit);
}

export async function getDealParticipations(dealId: string) {
  if (!dealId) return [];

  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return [];
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from('deal_participations')
    .select(`
      *,
      factory:factories(id, name, city, contact_email)
    `)
    .eq('deal_id', dealId)
    .order('joined_at', { ascending: false });

  return data || [];
}

export async function getTransactions(status?: string) {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return [];
  }

  const supabase = await createClient();

  let query = supabase
    .from('transactions')
    .select(`
      *,
      factory:factories(id, name)
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data } = await query;
  return data || [];
}

export async function updateTransactionStatus(
  transactionId: string,
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled',
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!transactionId) {
    return { success: false, error: 'معرف المعاملة مطلوب' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'غير مصرح' };
  }

  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return { success: false, error: 'غير مصرح' };
  }

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'paid') {
    updateData.verified_at = new Date().toISOString();
    updateData.verified_by = user.id;
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', transactionId);

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء تحديث المعاملة' };
  }

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'update_transaction',
    target_type: 'transaction',
    target_id: transactionId,
    details: { new_status: status, notes },
  });

  revalidatePath('/admin/transactions');
  return { success: true };
}
