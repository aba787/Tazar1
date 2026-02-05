'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CreateDealData {
  title: string;
  description?: string;
  materialType: string;
  materialSpecs?: Record<string, unknown>;
  minQuantity: number;
  maxQuantity?: number;
  unit: string;
  marketPricePerUnit: number;
  escrowPercentage?: number;
  deliveryTerms?: string;
  deliveryLocation?: string;
  estimatedDeliveryDays?: number;
  aggregationDeadline?: string;
  commitmentDeadline?: string;
  rfqDeadline?: string;
  category?: string;
  tags?: string[];
  pricingTiers: Array<{
    tierLabel: string;
    minQuantity: number;
    maxQuantity: number | null;
    pricePerUnit: number;
    discountPercentage: number;
  }>;
}

async function getUserFactory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: factory } = await supabase
    .from('factories')
    .select('id, status')
    .eq('user_id', user.id)
    .single();
  
  return factory;
}

export async function createDeal(data: CreateDealData): Promise<{ success: boolean; dealId?: string; error?: string }> {
  const supabase = await createClient();
  const factory = await getUserFactory();
  
  if (!factory) {
    return { success: false, error: 'يجب أن يكون لديك مصنع مسجل لإنشاء صفقة' };
  }
  
  if (factory.status !== 'verified') {
    return { success: false, error: 'يجب التحقق من المصنع أولاً' };
  }
  
  if (!data.title || data.title.trim().length < 5) {
    return { success: false, error: 'عنوان الصفقة يجب أن يكون 5 أحرف على الأقل' };
  }
  
  if (data.minQuantity <= 0) {
    return { success: false, error: 'الحد الأدنى للكمية يجب أن يكون أكبر من صفر' };
  }

  const { data: deal, error } = await supabase
    .from('procurement_deals')
    .insert({
      title: data.title.trim(),
      description: data.description?.trim(),
      material_type: data.materialType,
      material_specs: data.materialSpecs || {},
      min_quantity: data.minQuantity,
      max_quantity: data.maxQuantity,
      unit: data.unit,
      market_price_per_unit: data.marketPricePerUnit,
      escrow_percentage: data.escrowPercentage || 10,
      delivery_terms: data.deliveryTerms || 'DDP',
      delivery_location: data.deliveryLocation,
      estimated_delivery_days: data.estimatedDeliveryDays,
      aggregation_deadline: data.aggregationDeadline,
      commitment_deadline: data.commitmentDeadline,
      rfq_deadline: data.rfqDeadline,
      creator_factory_id: factory.id,
      status: 'draft',
      category: data.category,
      tags: data.tags,
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء إنشاء الصفقة' };
  }

  if (data.pricingTiers.length > 0) {
    const tiersData = data.pricingTiers.map((tier, index) => ({
      deal_id: deal.id,
      tier_index: index,
      tier_label: tier.tierLabel,
      min_quantity: tier.minQuantity,
      max_quantity: tier.maxQuantity,
      price_per_unit: tier.pricePerUnit,
      discount_percentage: tier.discountPercentage,
      is_active: true,
    }));

    await supabase.from('pricing_tiers').insert(tiersData);
  }

  revalidatePath('/group-buying');
  return { success: true, dealId: deal.id };
}

export async function publishDeal(dealId: string): Promise<{ success: boolean; error?: string }> {
  if (!dealId) {
    return { success: false, error: 'معرف الصفقة مطلوب' };
  }

  const supabase = await createClient();
  const factory = await getUserFactory();
  
  if (!factory) {
    return { success: false, error: 'غير مصرح' };
  }

  const { data: deal } = await supabase
    .from('procurement_deals')
    .select('creator_factory_id, status')
    .eq('id', dealId)
    .single();

  if (!deal || deal.creator_factory_id !== factory.id) {
    return { success: false, error: 'غير مصرح بنشر هذه الصفقة' };
  }

  if (deal.status !== 'draft') {
    return { success: false, error: 'يمكن نشر الصفقات المسودة فقط' };
  }

  const { error } = await supabase
    .from('procurement_deals')
    .update({ 
      status: 'open', 
      published_at: new Date().toISOString() 
    })
    .eq('id', dealId);

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء نشر الصفقة' };
  }

  revalidatePath('/group-buying');
  return { success: true };
}

export async function getOpenDeals() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('procurement_deals')
    .select(`
      *,
      creator:factories!creator_factory_id(id, name, city),
      pricing_tiers(*),
      participations:deal_participations(count)
    `)
    .in('status', ['open', 'aggregating', 'rfq_open'])
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
}

export async function getDealDetails(dealId: string) {
  if (!dealId) return null;

  const supabase = await createClient();

  const { data } = await supabase
    .from('procurement_deals')
    .select(`
      *,
      creator:factories!creator_factory_id(id, name, city, contact_email),
      pricing_tiers(*),
      specifications:deal_specifications(*),
      certifications:deal_certifications(*),
      participations:deal_participations(
        *,
        factory:factories(id, name, city)
      )
    `)
    .eq('id', dealId)
    .single();

  return data;
}

export async function joinDeal(data: {
  dealId: string;
  quantity: number;
  deliveryPreference: 'individual' | 'consolidated';
  deliveryAddress?: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!data.dealId || data.quantity <= 0) {
    return { success: false, error: 'بيانات غير صالحة' };
  }

  const supabase = await createClient();
  const factory = await getUserFactory();
  
  if (!factory) {
    return { success: false, error: 'يجب أن يكون لديك مصنع مسجل للانضمام' };
  }

  if (factory.status !== 'verified') {
    return { success: false, error: 'يجب التحقق من المصنع أولاً' };
  }

  const { data: deal } = await supabase
    .from('procurement_deals')
    .select('id, status, creator_factory_id')
    .eq('id', data.dealId)
    .single();

  if (!deal || deal.status !== 'open') {
    return { success: false, error: 'الصفقة غير متاحة للانضمام' };
  }

  if (deal.creator_factory_id === factory.id) {
    return { success: false, error: 'لا يمكن الانضمام لصفقتك الخاصة' };
  }

  const { data: existing } = await supabase
    .from('deal_participations')
    .select('id')
    .eq('deal_id', data.dealId)
    .eq('factory_id', factory.id)
    .single();

  if (existing) {
    return { success: false, error: 'أنت مشارك بالفعل في هذه الصفقة' };
  }

  const { error } = await supabase
    .from('deal_participations')
    .insert({
      deal_id: data.dealId,
      factory_id: factory.id,
      quantity: data.quantity,
      delivery_preference: data.deliveryPreference,
      delivery_address: data.deliveryAddress,
      notes: data.notes,
      status: 'interested',
    });

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء الانضمام' };
  }

  revalidatePath('/group-buying');
  revalidatePath(`/group-buying/${data.dealId}`);
  return { success: true };
}

export async function withdrawParticipation(participationId: string): Promise<{ success: boolean; error?: string }> {
  if (!participationId) {
    return { success: false, error: 'معرف المشاركة مطلوب' };
  }

  const supabase = await createClient();
  const factory = await getUserFactory();
  
  if (!factory) {
    return { success: false, error: 'غير مصرح' };
  }

  const { data: participation } = await supabase
    .from('deal_participations')
    .select('factory_id, status, deal_id')
    .eq('id', participationId)
    .single();

  if (!participation || participation.factory_id !== factory.id) {
    return { success: false, error: 'غير مصرح بسحب هذه المشاركة' };
  }

  if (!['interested', 'committed'].includes(participation.status)) {
    return { success: false, error: 'لا يمكن سحب المشاركة في هذه المرحلة' };
  }

  const { error } = await supabase
    .from('deal_participations')
    .update({ 
      status: 'withdrawn', 
      withdrawn_at: new Date().toISOString() 
    })
    .eq('id', participationId);

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء سحب المشاركة' };
  }

  revalidatePath('/group-buying');
  revalidatePath(`/group-buying/${participation.deal_id}`);
  return { success: true };
}

export async function getMyDeals() {
  const supabase = await createClient();
  const factory = await getUserFactory();
  
  if (!factory) return [];

  const { data } = await supabase
    .from('procurement_deals')
    .select(`
      *,
      pricing_tiers(*),
      participations:deal_participations(count)
    `)
    .eq('creator_factory_id', factory.id)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function getMyParticipations() {
  const supabase = await createClient();
  const factory = await getUserFactory();
  
  if (!factory) return [];

  const { data } = await supabase
    .from('deal_participations')
    .select(`
      *,
      deal:procurement_deals(
        id,
        title,
        status,
        material_type,
        min_quantity,
        current_quantity,
        unit,
        aggregation_deadline,
        creator:factories!creator_factory_id(name)
      )
    `)
    .eq('factory_id', factory.id)
    .order('joined_at', { ascending: false });

  return data || [];
}

export async function updateDealStatus(
  dealId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  if (!dealId || !status) {
    return { success: false, error: 'بيانات غير صالحة' };
  }

  const supabase = await createClient();
  const factory = await getUserFactory();
  
  if (!factory) {
    return { success: false, error: 'غير مصرح' };
  }

  const { data: deal } = await supabase
    .from('procurement_deals')
    .select('creator_factory_id')
    .eq('id', dealId)
    .single();

  if (!deal || deal.creator_factory_id !== factory.id) {
    return { success: false, error: 'غير مصرح بتحديث هذه الصفقة' };
  }

  const validTransitions: Record<string, string[]> = {
    'draft': ['open', 'cancelled'],
    'open': ['aggregating', 'cancelled'],
    'aggregating': ['pending_commitment', 'cancelled'],
    'pending_commitment': ['rfq_open', 'cancelled'],
    'rfq_open': ['evaluating_bids', 'cancelled'],
    'evaluating_bids': ['awarded', 'cancelled'],
    'awarded': ['in_production'],
    'in_production': ['shipping'],
    'shipping': ['delivered'],
    'delivered': ['completed'],
  };

  const { error } = await supabase
    .from('procurement_deals')
    .update({ status })
    .eq('id', dealId);

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء تحديث الحالة' };
  }

  revalidatePath('/group-buying');
  return { success: true };
}

export async function cancelDeal(dealId: string): Promise<{ success: boolean; error?: string }> {
  if (!dealId) {
    return { success: false, error: 'معرف الصفقة مطلوب' };
  }

  const supabase = await createClient();
  const factory = await getUserFactory();
  
  if (!factory) {
    return { success: false, error: 'غير مصرح' };
  }

  const { data: deal } = await supabase
    .from('procurement_deals')
    .select('creator_factory_id, status')
    .eq('id', dealId)
    .single();

  if (!deal || deal.creator_factory_id !== factory.id) {
    return { success: false, error: 'غير مصرح بإلغاء هذه الصفقة' };
  }

  const cancellableStatuses = ['draft', 'open', 'aggregating', 'pending_commitment', 'rfq_open'];
  if (!cancellableStatuses.includes(deal.status)) {
    return { success: false, error: 'لا يمكن إلغاء الصفقة في هذه المرحلة' };
  }

  const { error } = await supabase
    .from('procurement_deals')
    .update({ status: 'cancelled' })
    .eq('id', dealId);

  if (error) {
    return { success: false, error: 'حدث خطأ أثناء إلغاء الصفقة' };
  }

  revalidatePath('/group-buying');
  return { success: true };
}
