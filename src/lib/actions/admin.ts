'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

  const sanitizedReason = reason.trim().slice(0, 1000);

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

  const sanitizedReason = reason.trim().slice(0, 1000);

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
