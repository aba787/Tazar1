'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  MapPin,
  Star,
  Settings,
  X,
  Clock,
  User,
  Cog,
  FileText,
  CheckCircle,
  TrendingDown,
  Check,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
} from '@/components/ui';
import { RFQModal } from '@/components/features/RFQModal';
import { cn, formatCurrency } from '@/lib/utils';
import type {
  EquipmentCapability,
  EquipmentCapabilityStatus,
  ContractType,
} from '@/types';
import {
  EQUIPMENT_CAPABILITY_STATUS_LABELS,
  CONTRACT_TYPE_LABELS,
} from '@/types';

// ============================================================================
// MOCK DATA
// ============================================================================

const equipmentListings: EquipmentCapability[] = [
  {
    id: '1',
    factoryId: 'f1',
    name: 'ماكينة CNC خمس محاور',
    type: 'cnc_machine',
    brand: 'Haas',
    model: 'UMC-750',
    year: 2022,
    description: 'ماكينة CNC متقدمة للتشغيل الدقيق، مناسبة للألمنيوم والصلب والتيتانيوم',
    images: [],
    specifications: {
      maxDimensions: '762 x 508 x 508 mm',
      maxWeight: '300 kg',
      tolerance: '±0.005 mm',
      materials: ['ألمنيوم', 'صلب', 'تيتانيوم', 'نحاس'],
      certifications: ['ISO 9001', 'SASO'],
    },
    capacity: {
      unitsPerHour: 12,
      unitsPerShift: 80,
      maxBatchSize: 500,
    },
    pricing: [
      { type: 'hourly', hourlyRate: 25000, currency: 'SAR' },
      { type: 'shift', shiftRate: 150000, currency: 'SAR' },
      { type: 'unit', unitRate: 4500, currency: 'SAR' },
    ],
    availability: {
      shifts: { morning: true, evening: true, night: false },
      leadTimeDays: 3,
      minContractDays: 1,
    },
    operator: {
      available: true,
      included: false,
      operatorRate: 20000,
      requiredCertifications: ['CNC Level 3'],
    },
    location: 'المنطقة الصناعية الثانية',
    city: 'الرياض',
    status: 'available',
    rating: 4.8,
    completedJobs: 47,
    ownerName: 'مصنع التقنية المتقدمة',
    ownerVerified: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    factoryId: 'f2',
    name: 'مكبس هيدروليكي 200 طن',
    type: 'press',
    brand: 'Schuler',
    model: 'HPX-200',
    year: 2021,
    description: 'مكبس هيدروليكي للتشكيل والكبس، مثالي للصفائح المعدنية',
    images: [],
    specifications: {
      maxDimensions: '1000 x 800 mm',
      maxWeight: '50 kg per piece',
      tolerance: '±0.1 mm',
      materials: ['صفائح حديد', 'ألمنيوم', 'نحاس'],
      certifications: ['ISO 9001'],
    },
    capacity: {
      unitsPerHour: 120,
      unitsPerShift: 800,
      maxBatchSize: 10000,
    },
    pricing: [
      { type: 'hourly', hourlyRate: 18000, currency: 'SAR' },
      { type: 'shift', shiftRate: 120000, currency: 'SAR' },
      { type: 'unit', unitRate: 350, currency: 'SAR' },
    ],
    availability: {
      shifts: { morning: true, evening: true, night: true },
      leadTimeDays: 2,
      minContractDays: 1,
    },
    operator: {
      available: true,
      included: true,
    },
    location: 'المدينة الصناعية',
    city: 'الدمام',
    status: 'available',
    rating: 4.5,
    completedJobs: 89,
    ownerName: 'مصنع الخليج للمعادن',
    ownerVerified: true,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-10',
  },
  {
    id: '3',
    factoryId: 'f3',
    name: 'خط لحام روبوتي',
    type: 'welding',
    brand: 'KUKA',
    model: 'KR 16 Arc HW',
    year: 2023,
    description: 'خط لحام آلي بذراع روبوتية، مناسب للإنتاج الكمي',
    images: [],
    specifications: {
      maxDimensions: '2000 x 1500 x 1000 mm',
      tolerance: '±0.5 mm',
      materials: ['صلب كربوني', 'ستانلس ستيل', 'ألمنيوم'],
      certifications: ['ISO 3834', 'AWS D1.1'],
    },
    capacity: {
      unitsPerHour: 30,
      unitsPerShift: 200,
      maxBatchSize: 2000,
    },
    pricing: [
      { type: 'shift', shiftRate: 250000, currency: 'SAR' },
      { type: 'unit', unitRate: 2500, currency: 'SAR' },
      { type: 'project', projectMinimum: 1500000, currency: 'SAR' },
    ],
    availability: {
      shifts: { morning: true, evening: false, night: false },
      leadTimeDays: 5,
      minContractDays: 3,
    },
    operator: {
      available: true,
      included: true,
      requiredCertifications: ['Welding Inspector Level 2'],
    },
    location: 'المنطقة الصناعية',
    city: 'جدة',
    status: 'available',
    rating: 4.9,
    completedJobs: 23,
    ownerName: 'مصنع النجوم للحام',
    ownerVerified: true,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-05',
  },
];

// Filter categories
const equipmentCategories = [
  { label: 'الكل', value: 'ALL' },
  { label: 'CNC', value: 'cnc_machine' },
  { label: 'مكابس', value: 'press' },
  { label: 'لحام', value: 'welding' },
  { label: 'قطع', value: 'cutting' },
  { label: 'أخرى', value: 'other' },
];

const contractTypeFilters = [
  { label: 'الكل', value: 'ALL' },
  { label: 'بالقطعة', value: 'unit' },
  { label: 'بالوردية', value: 'shift' },
  { label: 'بالساعة', value: 'hourly' },
  { label: 'بالمشروع', value: 'project' },
];

// Stats data
const statsData = [
  {
    icon: Cog,
    value: 24,
    label: 'قدرات متاحة',
  },
  {
    icon: FileText,
    value: 8,
    label: 'طلبات عروض نشطة',
  },
  {
    icon: CheckCircle,
    value: 156,
    label: 'مشاريع مكتملة',
  },
  {
    icon: TrendingDown,
    value: '23%',
    label: 'متوسط التوفير',
  },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const glassCardClass = `
  rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
  border border-gray-200/50 dark:border-gray-700/50
  shadow-[0_8px_32px_rgba(0,0,0,0.06)]
  hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)]
  hover:-translate-y-0.5 transition-all duration-300
`;

const statusColors: Record<EquipmentCapabilityStatus, string> = {
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  busy: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  maintenance: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const contractTypeColors: Record<ContractType, { bg: string; text: string }> = {
  unit: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  shift: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  hourly: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  project: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
};

function EquipmentCapabilityCard({
  equipment,
  onRequestQuote,
}: {
  equipment: EquipmentCapability;
  onRequestQuote: () => void;
}) {
  const [selectedPricing, setSelectedPricing] = useState<ContractType>(equipment.pricing[0]?.type || 'shift');

  const currentPricing = equipment.pricing.find((p) => p.type === selectedPricing);

  const getPriceDisplay = () => {
    if (!currentPricing) return '—';
    switch (currentPricing.type) {
      case 'hourly':
        return `${formatCurrency(currentPricing.hourlyRate || 0)}/ساعة`;
      case 'shift':
        return `${formatCurrency(currentPricing.shiftRate || 0)}/وردية`;
      case 'unit':
        return `${formatCurrency(currentPricing.unitRate || 0)}/قطعة`;
      case 'project':
        return `من ${formatCurrency(currentPricing.projectMinimum || 0)}`;
      default:
        return '—';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(glassCardClass, 'overflow-hidden')}
    >
      {/* Header with Image Placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
        <Settings className="h-12 w-12 text-gray-400" />
        <Badge className={cn('absolute top-3 right-3', statusColors[equipment.status])}>
          {EQUIPMENT_CAPABILITY_STATUS_LABELS[equipment.status]}
        </Badge>
      </div>

      <div className="p-5 space-y-4">
        {/* Title & Owner */}
        <div>
          <h3 className="font-bold text-foreground text-lg">{equipment.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <span>{equipment.ownerName}</span>
            {equipment.ownerVerified && <Check className="h-4 w-4 text-emerald-500" />}
          </div>
        </div>

        {/* Rating & Location */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium font-numbers">{equipment.rating}</span>
            <span className="text-muted-foreground">({equipment.completedJobs} مشروع)</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{equipment.city}</span>
          </div>
        </div>

        {/* Pricing Tabs */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">📦 نماذج التعاقد المتاحة:</p>
          <div className="flex flex-wrap gap-1.5">
            {equipment.pricing.map((p) => (
              <button
                key={p.type}
                onClick={() => setSelectedPricing(p.type)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  selectedPricing === p.type
                    ? cn(contractTypeColors[p.type].bg, contractTypeColors[p.type].text, 'ring-1 ring-current')
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {CONTRACT_TYPE_LABELS[p.type]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-lg font-bold font-numbers text-foreground">{getPriceDisplay()}</p>
        </div>

        {/* Operator & Shifts */}
        <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">المشغل:</span>
            <span className="font-medium">
              {equipment.operator.available ? (
                equipment.operator.included ? (
                  'متوفر (مشمول)'
                ) : (
                  <>
                    متوفر
                    {equipment.operator.operatorRate && (
                      <span className="text-muted-foreground">
                        {' '}
                        (+{formatCurrency(equipment.operator.operatorRate)})
                      </span>
                    )}
                  </>
                )
              ) : (
                'غير متوفر'
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">الورديات:</span>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xs',
                  equipment.availability.shifts.morning ? 'text-emerald-600' : 'text-gray-400 line-through'
                )}
              >
                صباحي {equipment.availability.shifts.morning ? '✓' : '✗'}
              </span>
              <span className="text-gray-300">|</span>
              <span
                className={cn(
                  'text-xs',
                  equipment.availability.shifts.evening ? 'text-emerald-600' : 'text-gray-400 line-through'
                )}
              >
                مسائي {equipment.availability.shifts.evening ? '✓' : '✗'}
              </span>
              <span className="text-gray-300">|</span>
              <span
                className={cn(
                  'text-xs',
                  equipment.availability.shifts.night ? 'text-emerald-600' : 'text-gray-400 line-through'
                )}
              >
                ليلي {equipment.availability.shifts.night ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button
          className="w-full"
          onClick={onRequestQuote}
          disabled={equipment.status !== 'available'}
        >
          {equipment.status === 'available' ? 'طلب عرض سعر (RFQ)' : 'غير متاح حالياً'}
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function CapacityExchangePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [contractFilter, setContractFilter] = useState('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentCapability | null>(null);
  const [isRFQModalOpen, setIsRFQModalOpen] = useState(false);

  // Filter equipment
  const filteredEquipment = equipmentListings.filter((eq) => {
    const matchesSearch =
      eq.name.includes(searchQuery) ||
      eq.description.includes(searchQuery) ||
      eq.city.includes(searchQuery) ||
      eq.ownerName.includes(searchQuery);
    const matchesCategory = categoryFilter === 'ALL' || eq.type === categoryFilter;
    const matchesContract =
      contractFilter === 'ALL' || eq.pricing.some((p) => p.type === contractFilter);
    return matchesSearch && matchesCategory && matchesContract;
  });

  const handleRequestQuote = (equipment: EquipmentCapability) => {
    setSelectedEquipment(equipment);
    setIsRFQModalOpen(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">تبادل الطاقة الإنتاجية</h1>
          <p className="text-muted-foreground">
            منصة التعاقد من الباطن - اطلب عروض أسعار من المصانع الشريكة
          </p>
        </div>
        <Button size="lg">
          <Plus className="ml-2 h-5 w-5" />
          أضف قدراتك الإنتاجية
        </Button>
      </div>

      {/* Stats Header */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {statsData.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <div className={cn(glassCardClass, 'p-4')}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  <stat.icon className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-numbers">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search & Filter Section */}
      <div className={cn(glassCardClass, 'p-4 space-y-4')}>
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {equipmentCategories.map((category) => (
            <Button
              key={category.value}
              variant={categoryFilter === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(category.value)}
              className="rounded-full px-4"
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Contract Type Filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground self-center ml-2">نوع التعاقد:</span>
          {contractTypeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setContractFilter(filter.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                contractFilter === filter.value
                  ? 'bg-foreground text-background'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث عن معدة بالاسم، الموقع، أو المزود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-12 text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Equipment Grid */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {filteredEquipment.map((equipment) => (
            <motion.div
              key={equipment.id}
              variants={itemVariants}
              layout
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <EquipmentCapabilityCard
                equipment={equipment}
                onRequestQuote={() => handleRequestQuote(equipment)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredEquipment.length === 0 && (
        <div className={cn(glassCardClass, 'p-12 text-center')}>
          <Settings className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-xl font-semibold">لا توجد قدرات إنتاجية</h3>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            لم يتم العثور على قدرات تطابق معايير البحث. جرب تغيير الفلاتر أو البحث بكلمات مختلفة.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('ALL');
              setContractFilter('ALL');
            }}
          >
            إعادة تعيين الفلاتر
          </Button>
        </div>
      )}

      {/* RFQ Modal */}
      {selectedEquipment && (
        <RFQModal
          isOpen={isRFQModalOpen}
          onClose={() => {
            setIsRFQModalOpen(false);
            setSelectedEquipment(null);
          }}
          equipment={selectedEquipment}
        />
      )}
    </div>
  );
}
