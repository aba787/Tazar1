'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// =====================================
// Admin Emails (for MVP - simple approach)
// =====================================
const ADMIN_EMAILS = [
  'admin@takamul.sa',
  'abduljabbar.gh.1@gmail.com',
];

// =====================================
// Check if current user is admin
// =====================================
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  return ADMIN_EMAILS.includes(user.email || '');
}

// =====================================
// Get admin dashboard stats
// =====================================
export async function getAdminStats() {
  const supabase = await createClient();

  // Factories counts
  const { count: totalFactories } = await supabase
    .from('factories')
    .select('*', { count: 'exact', head: true });

  const { count: pendingFactories } = await supabase
    .from('factories')
    .select('*', { count: 'exact', head: true })
    .eq('onboarding_status', 'submitted');

  const { count: verifiedFactories } = await supabase
    .from('factories')
    .select('*', { count: 'exact', head: true })
    .eq('onboarding_status', 'verified');

  const { count: rejectedFactories } = await supabase
    .from('factories')
    .select('*', { count: 'exact', head: true })
    .eq('onboarding_status', 'rejected');

  // Deals counts
  const { count: totalDeals } = await supabase
    .from('procurement_deals')
    .select('*', { count: 'exact', head: true });

  const { count: activeDeals } = await supabase
    .from('procurement_deals')
    .select('*', { count: 'exact', head: true })
    .in('status', ['open', 'aggregating', 'rfq_open']);

  // Equipment counts
  const { count: totalEquipment } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true });

  const { count: availableEquipment } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available');

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

// =====================================
// Get pending factories for approval
// =====================================
export async function getPendingFactories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('factories')
    .select(`
      *,
      documents:factory_documents(*),
      capabilities:factory_capabilities(*)
    `)
    .eq('onboarding_status', 'submitted')
    .order('submitted_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending factories:', error);
    return [];
  }

  return data || [];
}

// =====================================
// Get all factories with filters
// =====================================
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

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching factories:', error);
    return [];
  }

  return data || [];
}

// =====================================
// Get single factory details
// =====================================
export async function getFactoryDetails(factoryId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('factories')
    .select(`
      *,
      documents:factory_documents(*),
      capabilities:factory_capabilities(*)
    `)
    .eq('id', factoryId)
    .single();

  if (error) {
    console.error('Error fetching factory details:', error);
    return null;
  }

  return data;
}

// =====================================
// Approve factory
// =====================================
export async function approveFactory(factoryId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
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
    console.error('Error approving factory:', error);
    return { success: false, error: error.message };
  }

  // Log admin action
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

// =====================================
// Reject factory
// =====================================
export async function rejectFactory(factoryId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'غير مصرح' };
  }

  const { error } = await supabase
    .from('factories')
    .update({
      onboarding_status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', factoryId);

  if (error) {
    console.error('Error rejecting factory:', error);
    return { success: false, error: error.message };
  }

  // Log admin action
  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'reject_factory',
    target_type: 'factory',
    target_id: factoryId,
    details: { reason },
  });

  revalidatePath('/admin/factories');
  revalidatePath('/admin');

  return { success: true };
}

// =====================================
// Suspend factory
// =====================================
export async function suspendFactory(factoryId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'غير مصرح' };
  }

  const { error } = await supabase
    .from('factories')
    .update({
      status: 'suspended',
      suspension_reason: reason,
      suspended_at: new Date().toISOString(),
    })
    .eq('id', factoryId);

  if (error) {
    console.error('Error suspending factory:', error);
    return { success: false, error: error.message };
  }

  // Log admin action
  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: 'suspend_factory',
    target_type: 'factory',
    target_id: factoryId,
    details: { reason },
  });

  revalidatePath('/admin/factories');

  return { success: true };
}

// =====================================
// Get all deals
// =====================================
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

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching deals:', error);
    return [];
  }

  return data || [];
}

// =====================================
// Get all equipment
// =====================================
export async function getEquipment() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('equipment')
    .select(`
      *,
      factory:factories(name, city)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }

  return data || [];
}

// =====================================
// Get recent admin logs
// =====================================
export async function getAdminLogs(limit: number = 50) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching admin logs:', error);
    return [];
  }

  return data || [];
}

// =====================================
// Get current admin user
// =====================================
export async function getCurrentAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return null;
  }

  return user;
}
