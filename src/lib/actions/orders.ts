'use server';

import { createClient } from '@/lib/supabase/server';

export interface OrderItem {
  id: string;
  title: string;
  type: 'group_buying' | 'capacity_exchange';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  amount: number;
  quantity?: string;
  createdAt: string;
  updatedAt: string;
  details: string;
  timeline: {
    label: string;
    date: string;
    completed: boolean;
  }[];
}

export async function getUserOrders(): Promise<OrderItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: factory } = await supabase
    .from('factories')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!factory) return [];

  const orders: OrderItem[] = [];

  const { data: participations } = await supabase
    .from('deal_participants')
    .select(`
      id,
      quantity,
      total_cost,
      status,
      commitment_status,
      created_at,
      updated_at,
      deal:procurement_deals(id, title, status, unit)
    `)
    .eq('factory_id', factory.id)
    .order('created_at', { ascending: false });

  if (participations) {
    for (const p of participations) {
      const dealArr = p.deal as unknown as { id: string; title: string; status: string; unit: string }[] | null;
      const deal = Array.isArray(dealArr) ? dealArr[0] : (p.deal as unknown as { id: string; title: string; status: string; unit: string } | null);
      if (!deal) continue;

      let orderStatus: OrderItem['status'] = 'pending';
      if (p.status === 'cancelled' || p.commitment_status === 'cancelled') {
        orderStatus = 'cancelled';
      } else if (['delivered', 'completed'].includes(deal.status)) {
        orderStatus = 'completed';
      } else if (['in_production', 'shipping', 'awarded'].includes(deal.status)) {
        orderStatus = 'active';
      }

      const timeline = buildGroupBuyingTimeline(deal.status, p.commitment_status as string, p.created_at);

      orders.push({
        id: p.id,
        title: deal.title || 'صفقة شراء جماعي',
        type: 'group_buying',
        status: orderStatus,
        amount: p.total_cost || 0,
        quantity: p.quantity ? `${p.quantity} ${deal.unit || 'وحدة'}` : undefined,
        createdAt: p.created_at,
        updatedAt: p.updated_at || p.created_at,
        details: `مشاركة في صفقة شراء جماعي`,
        timeline,
      });
    }
  }

  const { data: rfqs } = await supabase
    .from('capacity_exchange_rfqs')
    .select(`
      id,
      title,
      description,
      budget_min,
      budget_max,
      status,
      created_at,
      updated_at
    `)
    .eq('factory_id', factory.id)
    .order('created_at', { ascending: false });

  if (rfqs) {
    for (const rfq of rfqs) {
      let orderStatus: OrderItem['status'] = 'pending';
      if (rfq.status === 'cancelled') orderStatus = 'cancelled';
      else if (rfq.status === 'completed') orderStatus = 'completed';
      else if (rfq.status === 'in_progress' || rfq.status === 'awarded') orderStatus = 'active';

      orders.push({
        id: rfq.id,
        title: rfq.title || 'طلب تبادل طاقة',
        type: 'capacity_exchange',
        status: orderStatus,
        amount: rfq.budget_max || rfq.budget_min || 0,
        createdAt: rfq.created_at,
        updatedAt: rfq.updated_at || rfq.created_at,
        details: rfq.description || 'طلب عرض سعر لتبادل الطاقة الإنتاجية',
        timeline: buildCapacityTimeline(rfq.status as string, rfq.created_at),
      });
    }
  }

  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return orders;
}

function buildGroupBuyingTimeline(dealStatus: string, commitmentStatus: string, createdAt: string) {
  const steps = [
    { label: 'تم الانضمام', date: createdAt, completed: true },
    { label: 'تأكيد الالتزام', date: '', completed: ['committed', 'paid'].includes(commitmentStatus) },
    { label: 'تجميع الطلبات', date: '', completed: ['rfq_open', 'evaluating_bids', 'awarded', 'in_production', 'shipping', 'delivered', 'completed'].includes(dealStatus) },
    { label: 'بدء الإنتاج', date: '', completed: ['in_production', 'shipping', 'delivered', 'completed'].includes(dealStatus) },
    { label: 'شحن', date: '', completed: ['shipping', 'delivered', 'completed'].includes(dealStatus) },
    { label: 'تم التسليم', date: '', completed: ['delivered', 'completed'].includes(dealStatus) },
  ];
  return steps;
}

function buildCapacityTimeline(status: string, createdAt: string) {
  const steps = [
    { label: 'تم الطلب', date: createdAt, completed: true },
    { label: 'مراجعة العروض', date: '', completed: ['in_progress', 'awarded', 'completed'].includes(status) },
    { label: 'قيد التنفيذ', date: '', completed: ['awarded', 'completed'].includes(status) },
    { label: 'مكتمل', date: '', completed: status === 'completed' },
  ];
  return steps;
}
