'use server';

import type {
  ProcurementDeal,
  PricingTier,
  DealParticipation,
  SupplierBid,
  BidEvaluation,
  TechnicalSpec,
  CertificationRequirement,
  DealStatus,
  DealParticipationStatus,
  BidStatus,
  Incoterm,
  MaterialType,
  AggregatorDisplayData,
} from '@/types';

// ========== Helper Functions ==========

/**
 * حساب الشريحة الحالية بناءً على الكمية
 */
function getCurrentTier(tiers: PricingTier[], quantity: number): PricingTier | null {
  const sortedTiers = [...tiers].sort((a, b) => b.tierIndex - a.tierIndex);

  for (const tier of sortedTiers) {
    if (quantity >= tier.minQuantity &&
        (tier.maxQuantity === null || quantity <= tier.maxQuantity)) {
      return tier;
    }
  }

  // إذا لم يتم العثور على شريحة، نرجع الشريحة الأولى
  return tiers.find(t => t.tierIndex === 0) || null;
}

/**
 * حساب الشريحة التالية
 */
function getNextTier(tiers: PricingTier[], currentTierIndex: number): PricingTier | null {
  return tiers.find(t => t.tierIndex === currentTierIndex + 1) || null;
}

/**
 * حساب الوقت المتبقي
 */
function calculateTimeRemaining(deadline: string | null): { days: number; hours: number; minutes: number } | null {
  if (!deadline) return null;

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

/**
 * حساب مبلغ الضمان
 */
function calculateEscrowAmount(
  pricePerUnit: number,
  quantity: number,
  escrowPercentage: number
): number {
  return Math.round((pricePerUnit * quantity * escrowPercentage) / 100);
}

// ========== Server Actions ==========

/**
 * إنشاء صفقة جديدة مع شرائح التسعير
 */
export async function createDeal(data: {
  title: string;
  description?: string;
  materialType: MaterialType;
  materialSpecs?: Record<string, unknown>;
  minQuantity: number;
  maxQuantity?: number;
  unit: string;
  marketPricePerUnit: number;
  escrowPercentage?: number;
  deliveryTerms?: Incoterm;
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
  specifications?: Array<Omit<TechnicalSpec, 'id' | 'dealId'>>;
  certifications?: Array<Omit<CertificationRequirement, 'id' | 'dealId'>>;
}): Promise<{ success: boolean; deal?: ProcurementDeal; error?: string }> {
  try {
    // في الإنتاج، سيتم استخدام Supabase لإنشاء الصفقة
    // const { data: deal, error } = await supabase.from('procurement_deals').insert(...)

    const dealId = crypto.randomUUID();

    const deal: ProcurementDeal = {
      id: dealId,
      title: data.title,
      description: data.description,
      materialType: data.materialType,
      materialSpecs: data.materialSpecs || {},
      minQuantity: data.minQuantity,
      maxQuantity: data.maxQuantity,
      currentQuantity: 0,
      unit: data.unit,
      marketPricePerUnit: data.marketPricePerUnit,
      escrowPercentage: data.escrowPercentage || 10,
      escrowReleaseOnDelivery: true,
      deliveryTerms: data.deliveryTerms || 'DDP',
      deliveryLocation: data.deliveryLocation,
      estimatedDeliveryDays: data.estimatedDeliveryDays,
      aggregationDeadline: data.aggregationDeadline,
      commitmentDeadline: data.commitmentDeadline,
      rfqDeadline: data.rfqDeadline,
      creatorFactoryId: undefined, // سيتم تعيينه من الجلسة
      status: 'draft',
      category: data.category,
      tags: data.tags,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pricingTiers: data.pricingTiers.map((tier, index) => ({
        id: crypto.randomUUID(),
        dealId,
        tierIndex: index,
        tierLabel: tier.tierLabel,
        minQuantity: tier.minQuantity,
        maxQuantity: tier.maxQuantity,
        pricePerUnit: tier.pricePerUnit,
        discountPercentage: tier.discountPercentage,
        isActive: true,
      })),
      specifications: (data.specifications || []).map((spec, index) => ({
        ...spec,
        id: crypto.randomUUID(),
        dealId,
        sortOrder: index,
      })),
      certifications: (data.certifications || []).map(cert => ({
        ...cert,
        id: crypto.randomUUID(),
        dealId,
      })),
      participations: [],
      bids: [],
    };

    return { success: true, deal };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الصفقة'
    };
  }
}

/**
 * نشر الصفقة (تغيير الحالة إلى open)
 */
export async function publishDeal(
  dealId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // في الإنتاج:
    // await supabase.from('procurement_deals')
    //   .update({ status: 'open', published_at: new Date().toISOString() })
    //   .eq('id', dealId)

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء نشر الصفقة'
    };
  }
}

/**
 * جلب الصفقة مع بيانات المجمّع
 */
export async function getDealWithAggregatorData(
  dealId: string,
  factoryId?: string
): Promise<{ success: boolean; data?: AggregatorDisplayData; error?: string }> {
  try {
    // في الإنتاج، سيتم جلب البيانات من Supabase
    // const { data: deal } = await supabase.from('procurement_deals')
    //   .select('*, pricing_tiers(*), specifications(*), certifications(*), participations(*), bids(*)')
    //   .eq('id', dealId)
    //   .single()

    // هنا نرجع بيانات وهمية للتطوير
    return {
      success: false,
      error: 'يجب تنفيذ الاتصال بقاعدة البيانات'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب بيانات الصفقة'
    };
  }
}

/**
 * الانضمام للصفقة
 */
export async function joinDeal(data: {
  dealId: string;
  factoryId: string;
  quantity: number;
  deliveryPreference: 'individual' | 'consolidated';
  deliveryAddress?: string;
  deliveryIncoterm?: Incoterm;
  notes?: string;
}): Promise<{ success: boolean; participation?: DealParticipation; escrowAmount?: number; error?: string }> {
  try {
    // حساب مبلغ الضمان
    // في الإنتاج، سيتم جلب سعر الشريحة الحالية من قاعدة البيانات

    const participationId = crypto.randomUUID();

    const participation: DealParticipation = {
      id: participationId,
      dealId: data.dealId,
      factoryId: data.factoryId,
      quantity: data.quantity,
      deliveryPreference: data.deliveryPreference,
      deliveryAddress: data.deliveryAddress,
      deliveryIncoterm: data.deliveryIncoterm,
      status: 'interested',
      notes: data.notes,
      joinedAt: new Date().toISOString(),
    };

    // في الإنتاج:
    // const { data: inserted } = await supabase.from('deal_participations').insert(participation)

    return { success: true, participation };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء الانضمام للصفقة'
    };
  }
}

/**
 * تأكيد الالتزام بالمشاركة (تقديم أمر الشراء)
 */
export async function commitToParticipation(data: {
  participationId: string;
  poNumber: string;
  poDocumentUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // في الإنتاج:
    // await supabase.from('deal_participations')
    //   .update({
    //     status: 'committed',
    //     po_number: data.poNumber,
    //     po_document_url: data.poDocumentUrl,
    //     po_submitted_at: new Date().toISOString(),
    //     committed_at: new Date().toISOString(),
    //   })
    //   .eq('id', data.participationId)

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تأكيد الالتزام'
    };
  }
}

/**
 * دفع الضمان
 */
export async function payEscrow(data: {
  participationId: string;
  transactionId: string;
  amount: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // في الإنتاج:
    // await supabase.from('deal_participations')
    //   .update({
    //     status: 'escrow_paid',
    //     escrow_amount: data.amount,
    //     escrow_transaction_id: data.transactionId,
    //     escrow_paid_at: new Date().toISOString(),
    //   })
    //   .eq('id', data.participationId)

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء دفع الضمان'
    };
  }
}

/**
 * تقديم عرض من المورد
 */
export async function submitBid(data: {
  dealId: string;
  supplierId: string;
  pricePerUnit: number;
  totalCapacity?: number;
  leadTimeDays: number;
  incoterm: Incoterm;
  deliveryLocation?: string;
  paymentTerms?: string;
  technicalProposalUrl?: string;
  commercialProposalUrl?: string;
  sampleAvailable?: boolean;
  validUntil?: string;
  notes?: string;
}): Promise<{ success: boolean; bid?: SupplierBid; error?: string }> {
  try {
    const bidId = crypto.randomUUID();
    const now = new Date().toISOString();

    const bid: SupplierBid = {
      id: bidId,
      dealId: data.dealId,
      supplierId: data.supplierId,
      pricePerUnit: data.pricePerUnit,
      totalCapacity: data.totalCapacity,
      leadTimeDays: data.leadTimeDays,
      incoterm: data.incoterm,
      deliveryLocation: data.deliveryLocation,
      paymentTerms: data.paymentTerms,
      technicalProposalUrl: data.technicalProposalUrl,
      commercialProposalUrl: data.commercialProposalUrl,
      sampleAvailable: data.sampleAvailable || false,
      validUntil: data.validUntil,
      status: 'submitted',
      notes: data.notes,
      createdAt: now,
      submittedAt: now,
      updatedAt: now,
    };

    // في الإنتاج:
    // const { data: inserted } = await supabase.from('supplier_bids').insert(bid)

    return { success: true, bid };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تقديم العرض'
    };
  }
}

/**
 * تقييم العرض
 */
export async function evaluateBid(data: {
  bidId: string;
  evaluatorFactoryId: string;
  priceScore: number;
  qualityScore: number;
  deliveryScore: number;
  complianceScore: number;
  comments?: string;
}): Promise<{ success: boolean; evaluation?: BidEvaluation; error?: string }> {
  try {
    // الأوزان الافتراضية
    const weights = {
      price: 40,
      quality: 25,
      delivery: 20,
      compliance: 15,
    };

    const weightedScore =
      (data.priceScore * weights.price / 100) +
      (data.qualityScore * weights.quality / 100) +
      (data.deliveryScore * weights.delivery / 100) +
      (data.complianceScore * weights.compliance / 100);

    const evaluation: BidEvaluation = {
      id: crypto.randomUUID(),
      bidId: data.bidId,
      evaluatorFactoryId: data.evaluatorFactoryId,
      priceScore: data.priceScore,
      qualityScore: data.qualityScore,
      deliveryScore: data.deliveryScore,
      complianceScore: data.complianceScore,
      priceWeight: weights.price,
      qualityWeight: weights.quality,
      deliveryWeight: weights.delivery,
      complianceWeight: weights.compliance,
      weightedScore,
      comments: data.comments,
      evaluatedAt: new Date().toISOString(),
    };

    // في الإنتاج:
    // const { data: inserted } = await supabase.from('bid_evaluations').insert(evaluation)

    return { success: true, evaluation };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تقييم العرض'
    };
  }
}

/**
 * ترسية العرض الفائز
 */
export async function awardBid(data: {
  dealId: string;
  winningBidId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // في الإنتاج:
    // 1. تحديث العرض الفائز
    // await supabase.from('supplier_bids')
    //   .update({ status: 'awarded' })
    //   .eq('id', data.winningBidId)

    // 2. رفض باقي العروض
    // await supabase.from('supplier_bids')
    //   .update({ status: 'rejected' })
    //   .eq('deal_id', data.dealId)
    //   .neq('id', data.winningBidId)
    //   .in('status', ['submitted', 'under_review', 'shortlisted'])

    // 3. تحديث حالة الصفقة
    // await supabase.from('procurement_deals')
    //   .update({ status: 'awarded', awarded_at: new Date().toISOString() })
    //   .eq('id', data.dealId)

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء ترسية العرض'
    };
  }
}

/**
 * سحب المشاركة
 */
export async function withdrawParticipation(
  participationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // في الإنتاج:
    // await supabase.from('deal_participations')
    //   .update({ status: 'withdrawn', withdrawn_at: new Date().toISOString() })
    //   .eq('id', participationId)

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء سحب المشاركة'
    };
  }
}

/**
 * تحديث حالة الصفقة
 */
export async function updateDealStatus(
  dealId: string,
  status: DealStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    // في الإنتاج:
    // await supabase.from('procurement_deals')
    //   .update({ status, updated_at: new Date().toISOString() })
    //   .eq('id', dealId)

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث حالة الصفقة'
    };
  }
}

// ========== Utility Exports ==========

export {
  getCurrentTier,
  getNextTier,
  calculateTimeRemaining,
  calculateEscrowAmount,
};
