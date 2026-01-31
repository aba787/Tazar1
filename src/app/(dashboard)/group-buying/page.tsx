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
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Input,
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
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-50">
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
            <h3 className="font-bold text-gray-900 line-clamp-1">{deal.title}</h3>
          </div>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{deal.description}</p>
      </div>

      {/* Tier Preview */}
      <div className="p-4 bg-gradient-to-l from-gray-50 to-white">
        <SmartAggregator data={aggregatorData} compact />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 p-4 border-t border-gray-50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Users className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm font-bold text-gray-900">{participantCount}</p>
          <p className="text-[10px] text-gray-400">مشارك</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Package className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm font-bold text-gray-900">{formatNumber(deal.currentQuantity)}</p>
          <p className="text-[10px] text-gray-400">{deal.unit}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm font-bold text-gray-900">
            {timeRemaining ? `${timeRemaining.days}` : '-'}
          </p>
          <p className="text-[10px] text-gray-400">يوم متبقي</p>
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

  // Filter deals
  const filteredDeals = useMemo(() => {
    return mockDeals.filter(deal => {
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
    console.log('Join deal:', selectedDeal?.id, data);
    // In production, call server action here
    setShowJoinModal(false);
    setSelectedDeal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الشراء الاستراتيجي</h1>
          <p className="text-gray-500">
            صفقات شراء جماعي مع شرائح تسعير ذكية وضمان مالي
          </p>
        </div>
        <Button>
          <Plus className="ml-2 h-5 w-5" />
          إنشاء صفقة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Package className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeDeals}</p>
              <p className="text-sm text-gray-500">صفقة نشطة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalVolume)}</p>
              <p className="text-sm text-gray-500">إجمالي الكميات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <TrendingDown className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgSavings}%</p>
              <p className="text-sm text-gray-500">متوسط التوفير</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Gavel className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeBids}</p>
              <p className="text-sm text-gray-500">طلب عروض مفتوح</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {filter.icon}
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              onViewDetails={() => console.log('View details:', deal.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && (
        <Card className="p-12 text-center bg-white">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">لا توجد صفقات</h3>
          <p className="mt-2 text-gray-500">
            لم يتم العثور على صفقات تطابق معايير البحث
          </p>
          <Button className="mt-4">
            <Plus className="ml-2 h-4 w-4" />
            إنشاء صفقة جديدة
          </Button>
        </Card>
      )}

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
