'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  TrendingDown,
  Package,
  Users,
  Clock,
  Filter,
  ChevronLeft,
  Zap,
  BarChart3,
  Gavel,
  Layers,
  X,
  CheckCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
} from '@/components/ui';
import { SmartAggregator, JoinDealModal } from '@/components/features';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type {
  ProcurementDeal,
  PricingTier,
  DealStatus,
  MaterialType,
  AggregatorDisplayData,
  DealParticipation,
} from '@/types';
import {
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  MATERIAL_LABELS,
} from '@/types';

// ========== Mock Data ==========

const mockPricingTiers: PricingTier[] = [
  { id: '1', dealId: 'd1', tierIndex: 0, tierLabel: 'الشريحة الأساسية', minQuantity: 1, maxQuantity: 50, pricePerUnit: 550000, discountPercentage: 0, isActive: true },
  { id: '2', dealId: 'd1', tierIndex: 1, tierLabel: 'الشريحة الفضية', minQuantity: 51, maxQuantity: 100, pricePerUnit: 522500, discountPercentage: 5, isActive: true },
  { id: '3', dealId: 'd1', tierIndex: 2, tierLabel: 'الشريحة الذهبية', minQuantity: 101, maxQuantity: 200, pricePerUnit: 495000, discountPercentage: 10, isActive: true },
  { id: '4', dealId: 'd1', tierIndex: 3, tierLabel: 'الشريحة البلاتينية', minQuantity: 201, maxQuantity: null, pricePerUnit: 467500, discountPercentage: 15, isActive: true },
];

const mockDeals: ProcurementDeal[] = [
  {
    id: 'd1',
    title: 'ألومنيوم خام 6061 - دفعة الربع الأول',
    description: 'ألومنيوم خام عالي النقاء للتصنيع، مطابق لمواصفات سابك، مناسب لصناعة الأبواب والنوافذ والهياكل المعدنية',
    materialType: 'aluminum',
    materialSpecs: { purity: '99.5%', alloy: '6061', grade: 'A' },
    minQuantity: 10,
    maxQuantity: 500,
    currentQuantity: 85,
    unit: 'طن',
    marketPricePerUnit: 550000,
    escrowPercentage: 10,
    escrowReleaseOnDelivery: true,
    deliveryTerms: 'DDP',
    deliveryLocation: 'الرياض - المنطقة الصناعية الثانية',
    estimatedDeliveryDays: 21,
    aggregationDeadline: '2026-02-15T23:59:59Z',
    commitmentDeadline: '2026-02-20T23:59:59Z',
    rfqDeadline: '2026-02-25T23:59:59Z',
    creatorFactoryId: 'f1',
    status: 'aggregating',
    category: 'metals',
    tags: ['ألومنيوم', '6061', 'سابك'],
    featured: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
    publishedAt: '2026-01-05T00:00:00Z',
    pricingTiers: mockPricingTiers,
    specifications: [],
    certifications: [],
    participations: [],
    bids: [],
  },
  {
    id: 'd2',
    title: 'صفائح حديد مجلفن بالغمس الساخن',
    description: 'صفائح حديد مجلفنة بالغمس الساخن، سماكات متعددة، مثالية للبناء والتشييد',
    materialType: 'steel',
    materialSpecs: { thickness: '1.2-2.0mm', standard: 'JIS G3302' },
    minQuantity: 20,
    maxQuantity: 300,
    currentQuantity: 120,
    unit: 'طن',
    marketPricePerUnit: 420000,
    escrowPercentage: 10,
    escrowReleaseOnDelivery: true,
    deliveryTerms: 'DDP',
    deliveryLocation: 'جدة - ميناء جدة الإسلامي',
    estimatedDeliveryDays: 30,
    aggregationDeadline: '2026-02-10T23:59:59Z',
    status: 'rfq_open',
    category: 'metals',
    tags: ['حديد', 'مجلفن', 'بناء'],
    featured: false,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
    pricingTiers: [
      { id: '5', dealId: 'd2', tierIndex: 0, tierLabel: 'الشريحة الأساسية', minQuantity: 1, maxQuantity: 100, pricePerUnit: 420000, discountPercentage: 0, isActive: true },
      { id: '6', dealId: 'd2', tierIndex: 1, tierLabel: 'الشريحة الفضية', minQuantity: 101, maxQuantity: 200, pricePerUnit: 399000, discountPercentage: 5, isActive: true },
      { id: '7', dealId: 'd2', tierIndex: 2, tierLabel: 'الشريحة الذهبية', minQuantity: 201, maxQuantity: null, pricePerUnit: 378000, discountPercentage: 10, isActive: true },
    ],
    specifications: [],
    certifications: [],
    participations: [],
    bids: [],
  },
  {
    id: 'd3',
    title: 'حبيبات بلاستيك HDPE للقولبة',
    description: 'حبيبات بولي إيثيلين عالي الكثافة للقولبة بالحقن، مناسبة لتصنيع العبوات والأنابيب',
    materialType: 'plastic_pellets',
    materialSpecs: { density: '0.95', mfi: '8 g/10min', color: 'natural' },
    minQuantity: 5,
    maxQuantity: 200,
    currentQuantity: 55,
    unit: 'طن',
    marketPricePerUnit: 680000,
    escrowPercentage: 15,
    escrowReleaseOnDelivery: true,
    deliveryTerms: 'FCA',
    estimatedDeliveryDays: 14,
    aggregationDeadline: '2026-02-05T23:59:59Z',
    status: 'awarded',
    category: 'plastics',
    tags: ['HDPE', 'بلاستيك', 'قولبة'],
    featured: false,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z',
    awardedAt: '2026-01-22T00:00:00Z',
    pricingTiers: [
      { id: '8', dealId: 'd3', tierIndex: 0, tierLabel: 'الشريحة الأساسية', minQuantity: 1, maxQuantity: 50, pricePerUnit: 680000, discountPercentage: 0, isActive: true },
      { id: '9', dealId: 'd3', tierIndex: 1, tierLabel: 'الشريحة الفضية', minQuantity: 51, maxQuantity: null, pricePerUnit: 612000, discountPercentage: 10, isActive: true },
    ],
    specifications: [],
    certifications: [],
    participations: [],
    bids: [],
  },
  {
    id: 'd4',
    title: 'مواد تغليف صناعية متعددة الطبقات',
    description: 'أغلفة بلاستيكية وكرتون للتغليف الصناعي، مقاومة للرطوبة والحرارة',
    materialType: 'packaging',
    materialSpecs: { layers: 3, material: 'PE/Carton' },
    minQuantity: 1000,
    maxQuantity: 50000,
    currentQuantity: 15000,
    unit: 'وحدة',
    marketPricePerUnit: 120,
    escrowPercentage: 5,
    escrowReleaseOnDelivery: true,
    deliveryTerms: 'DDP',
    estimatedDeliveryDays: 7,
    aggregationDeadline: '2026-02-20T23:59:59Z',
    status: 'open',
    category: 'packaging',
    tags: ['تغليف', 'كرتون', 'PE'],
    featured: true,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-23T00:00:00Z',
    pricingTiers: [
      { id: '10', dealId: 'd4', tierIndex: 0, tierLabel: 'الشريحة الأساسية', minQuantity: 1, maxQuantity: 10000, pricePerUnit: 120, discountPercentage: 0, isActive: true },
      { id: '11', dealId: 'd4', tierIndex: 1, tierLabel: 'الشريحة الفضية', minQuantity: 10001, maxQuantity: 25000, pricePerUnit: 108, discountPercentage: 10, isActive: true },
      { id: '12', dealId: 'd4', tierIndex: 2, tierLabel: 'الشريحة الذهبية', minQuantity: 25001, maxQuantity: null, pricePerUnit: 96, discountPercentage: 20, isActive: true },
    ],
    specifications: [],
    certifications: [],
    participations: [],
    bids: [],
  },
];

// ========== Helper Functions ==========

function calculateAggregatorData(deal: ProcurementDeal): AggregatorDisplayData {
  const sortedTiers = [...deal.pricingTiers].sort((a, b) => b.tierIndex - a.tierIndex);

  // Find current tier
  let currentTier: PricingTier | null = null;
  for (const tier of sortedTiers) {
    if (deal.currentQuantity >= tier.minQuantity &&
        (tier.maxQuantity === null || deal.currentQuantity <= tier.maxQuantity)) {
      currentTier = tier;
      break;
    }
  }
  if (!currentTier && deal.pricingTiers.length > 0) {
    currentTier = deal.pricingTiers.find(t => t.tierIndex === 0) || null;
  }

  // Find next tier
  const nextTier = currentTier
    ? deal.pricingTiers.find(t => t.tierIndex === currentTier!.tierIndex + 1) || null
    : deal.pricingTiers.find(t => t.tierIndex === 0) || null;

  // Calculate values
  const currentPricePerUnit = currentTier?.pricePerUnit || deal.marketPricePerUnit;
  const bestTier = deal.pricingTiers.reduce((best, tier) =>
    tier.pricePerUnit < best.pricePerUnit ? tier : best, deal.pricingTiers[0]);
  const bestPricePerUnit = bestTier?.pricePerUnit || deal.marketPricePerUnit;

  const currentSavingsPercentage = Math.round(
    ((deal.marketPricePerUnit - currentPricePerUnit) / deal.marketPricePerUnit) * 100
  );
  const totalSavingsPercentage = Math.round(
    ((deal.marketPricePerUnit - bestPricePerUnit) / deal.marketPricePerUnit) * 100
  );

  const maxQty = deal.maxQuantity || (bestTier?.minQuantity || 100) * 2;
  const progressPercentage = Math.min(Math.round((deal.currentQuantity / maxQty) * 100), 100);

  const quantityToNextTier = nextTier
    ? Math.max(0, nextTier.minQuantity - deal.currentQuantity)
    : 0;

  // Time remaining
  let timeRemaining: { days: number; hours: number; minutes: number } | null = null;
  let isDeadlinePassed = false;
  if (deal.aggregationDeadline) {
    const deadline = new Date(deal.aggregationDeadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff > 0) {
      timeRemaining = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      };
    } else {
      isDeadlinePassed = true;
    }
  }

  return {
    deal,
    currentTier,
    nextTier,
    quantityToNextTier,
    currentPricePerUnit,
    bestPricePerUnit,
    totalSavingsPercentage,
    currentSavingsPercentage,
    progressPercentage,
    participantCount: deal.participations.length || Math.floor(Math.random() * 10) + 3,
    timeRemaining,
    isDeadlinePassed,
  };
}

// ========== Components ==========

interface DealCardProps {
  deal: ProcurementDeal;
  onJoin: () => void;
  onViewDetails: () => void;
}

function ProcurementDealCard({ deal, onJoin, onViewDetails }: DealCardProps) {
  const aggregatorData = useMemo(() => calculateAggregatorData(deal), [deal]);
  const {
    currentTier,
    nextTier,
    quantityToNextTier,
    currentPricePerUnit,
    currentSavingsPercentage,
    progressPercentage,
    participantCount,
    timeRemaining,
  } = aggregatorData;

  const canJoin = ['open', 'aggregating'].includes(deal.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-border/80 transition-all"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                DEAL_STATUS_COLORS[deal.status]
              )}>
                {DEAL_STATUS_LABELS[deal.status]}
              </span>
              {deal.featured && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                  مميز
                </span>
              )}
            </div>
            <h3 className="font-bold text-foreground line-clamp-1">{deal.title}</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{deal.description}</p>
      </div>

      {/* Tier Preview */}
      <div className="p-4 bg-gradient-to-l from-muted to-card">
        <SmartAggregator data={aggregatorData} compact />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 p-4 border-t border-border/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Users className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm font-bold text-foreground">{participantCount}</p>
          <p className="text-[10px] text-muted-foreground">مشارك</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Package className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm font-bold text-foreground">{formatNumber(deal.currentQuantity)}</p>
          <p className="text-[10px] text-muted-foreground">{deal.unit}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm font-bold text-foreground">
            {timeRemaining ? `${timeRemaining.days}` : '-'}
          </p>
          <p className="text-[10px] text-muted-foreground">يوم متبقي</p>
        </div>
      </div>

      {/* Next Tier Hint */}
      {nextTier && quantityToNextTier > 0 && canJoin && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-700">
            <Zap className="w-4 h-4" />
            <span className="text-xs">
              باقي <strong>{formatNumber(quantityToNextTier)} {deal.unit}</strong> للشريحة التالية
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 pt-2 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onViewDetails}
        >
          عرض التفاصيل
        </Button>
        {canJoin && (
          <Button
            size="sm"
            className="flex-1"
            onClick={onJoin}
          >
            انضم للصفقة
            <ChevronLeft className="w-4 h-4 mr-1" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ========== Filters ==========

type CategoryFilter = 'all' | 'metals' | 'plastics' | 'chemicals' | 'packaging';
type StatusFilter = 'all' | 'open' | 'aggregating' | 'rfq_open' | 'awarded';

const categoryFilters: { label: string; value: CategoryFilter; icon: React.ReactNode }[] = [
  { label: 'الكل', value: 'all', icon: <Layers className="w-4 h-4" /> },
  { label: 'معادن', value: 'metals', icon: <Package className="w-4 h-4" /> },
  { label: 'بلاستيك', value: 'plastics', icon: <Package className="w-4 h-4" /> },
  { label: 'كيماويات', value: 'chemicals', icon: <Package className="w-4 h-4" /> },
  { label: 'تغليف', value: 'packaging', icon: <Package className="w-4 h-4" /> },
];

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'مفتوحة', value: 'open' },
  { label: 'جاري التجميع', value: 'aggregating' },
  { label: 'طلب عروض', value: 'rfq_open' },
  { label: 'تم الترسية', value: 'awarded' },
];

// ========== Main Page ==========

export default function GroupBuyingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDeal, setSelectedDeal] = useState<ProcurementDeal | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [viewingDeal, setViewingDeal] = useState<ProcurementDeal | null>(null);
  const [deals, setDeals] = useState<ProcurementDeal[]>(mockDeals);

  // Filter deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch =
        deal.title.includes(searchQuery) ||
        deal.description?.includes(searchQuery) ||
        deal.tags?.some(tag => tag.includes(searchQuery));
      const matchesCategory =
        categoryFilter === 'all' || deal.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' || deal.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, categoryFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeDeals = mockDeals.filter(d => ['open', 'aggregating', 'rfq_open'].includes(d.status));
    const totalVolume = mockDeals.reduce((acc, d) => acc + d.currentQuantity, 0);
    const avgSavings = Math.round(
      mockDeals.reduce((acc, d) => {
        const data = calculateAggregatorData(d);
        return acc + data.currentSavingsPercentage;
      }, 0) / mockDeals.length
    );
    const activeBids = mockDeals.filter(d => d.status === 'rfq_open').length;

    return { activeDeals: activeDeals.length, totalVolume, avgSavings, activeBids };
  }, []);

  const handleJoinDeal = (deal: ProcurementDeal) => {
    setSelectedDeal(deal);
    setShowJoinModal(true);
  };

  const handleSubmitJoin = async (data: unknown) => {
    if (selectedDeal) {
      setDeals(prev => prev.map(d => {
        if (d.id === selectedDeal.id) {
          const joinData = data as { quantity?: number };
          const addedQty = joinData?.quantity || selectedDeal.minQuantity || 10;
          return {
            ...d,
            currentQuantity: d.currentQuantity + addedQty,
            participations: [...d.participations, {} as DealParticipation],
          };
        }
        return d;
      }));
    }
    setShowJoinModal(false);
    setSelectedDeal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الشراء الاستراتيجي</h1>
          <p className="text-muted-foreground">
            صفقات شراء جماعي مع شرائح تسعير ذكية وضمان مالي
          </p>
        </div>
        <Button>
          <Plus className="ml-2 h-5 w-5" />
          اقتراح إضافة صفقة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Package className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeDeals}</p>
              <p className="text-sm text-muted-foreground">صفقة نشطة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <BarChart3 className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalVolume)}</p>
              <p className="text-sm text-muted-foreground">إجمالي الكميات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <TrendingDown className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgSavings}%</p>
              <p className="text-sm text-muted-foreground">متوسط التوفير</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Gavel className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeBids}</p>
              <p className="text-sm text-muted-foreground">طلب عروض مفتوح</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث عن صفقة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-12"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setCategoryFilter(filter.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
                    categoryFilter === filter.value
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  {filter.icon}
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 bg-background"
              >
                {statusFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deals Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredDeals.map((deal) => (
            <ProcurementDealCard
              key={deal.id}
              deal={deal}
              onJoin={() => handleJoinDeal(deal)}
              onViewDetails={() => setViewingDeal(deal)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && (
        <Card className="p-12 text-center bg-card">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">لا توجد صفقات</h3>
          <p className="mt-2 text-muted-foreground">
            لم يتم العثور على صفقات تطابق معايير البحث
          </p>
          <Button className="mt-4">
            <Plus className="ml-2 h-4 w-4" />
            اقتراح إضافة صفقة
          </Button>
        </Card>
      )}

      {/* Deal Detail Slide-Over */}
      <AnimatePresence>
        {viewingDeal && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingDeal(null)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-full max-w-lg bg-card shadow-2xl overflow-y-auto"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-lg border-b border-border px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">تفاصيل الصفقة</h2>
                <button
                  onClick={() => setViewingDeal(null)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={viewingDeal.status === 'open' ? 'success' : 'warning'}>
                      {DEAL_STATUS_LABELS[viewingDeal.status] || viewingDeal.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{viewingDeal.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{viewingDeal.title}</h3>
                  <p className="text-muted-foreground mt-2">{viewingDeal.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">الكمية الحالية</p>
                    <p className="text-lg font-bold">{viewingDeal.currentQuantity.toLocaleString('ar-SA')} {viewingDeal.unit}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">الكمية المستهدفة</p>
                    <p className="text-lg font-bold">{(viewingDeal.maxQuantity || viewingDeal.minQuantity).toLocaleString('ar-SA')} {viewingDeal.unit}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">المشاركون</p>
                    <p className="text-lg font-bold">{viewingDeal.participations.length} مصنع</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">سعر السوق</p>
                    <p className="text-lg font-bold">{viewingDeal.marketPricePerUnit > 0 ? formatCurrency(viewingDeal.marketPricePerUnit) : 'غير متوفر'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">شرائح الأسعار</h4>
                  <div className="space-y-2">
                    {viewingDeal.pricingTiers.map((tier) => {
                      const isCurrentTier = viewingDeal.currentQuantity >= tier.minQuantity &&
                        (tier.maxQuantity === null || viewingDeal.currentQuantity <= tier.maxQuantity);
                      return (
                        <div
                          key={tier.tierIndex}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-xl border transition-all',
                            isCurrentTier
                              ? 'border-foreground/30 bg-muted'
                              : 'border-border'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {isCurrentTier && <CheckCircle className="h-4 w-4 text-foreground" />}
                            <span className="font-medium text-sm">{tier.tierLabel}</span>
                          </div>
                          <div className="text-left">
                            <span className="font-bold">{formatCurrency(tier.pricePerUnit)}</span>
                            <span className="text-xs text-muted-foreground mr-1">/{viewingDeal.unit}</span>
                            {tier.discountPercentage > 0 && (
                              <span className="text-xs text-foreground font-medium mr-2">-{tier.discountPercentage}%</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">التقدم</h4>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-foreground h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (viewingDeal.currentQuantity / (viewingDeal.maxQuantity || viewingDeal.minQuantity)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((viewingDeal.currentQuantity / (viewingDeal.maxQuantity || viewingDeal.minQuantity)) * 100)}% من الهدف
                  </p>
                </div>

                {viewingDeal.tags && viewingDeal.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">الوسوم</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingDeal.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setViewingDeal(null);
                      handleJoinDeal(viewingDeal);
                    }}
                  >
                    الانضمام للصفقة
                  </Button>
                  <Button variant="outline" onClick={() => setViewingDeal(null)}>
                    إغلاق
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Join Deal Modal */}
      {selectedDeal && (
        <JoinDealModal
          isOpen={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedDeal(null);
          }}
          deal={selectedDeal}
          onSubmit={handleSubmitJoin}
        />
      )}
    </div>
  );
}
