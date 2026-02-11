// =====================================
// 🏭 منصة تآزر الصناعية - Types
// =====================================

// ========== المصنع ==========
export interface Factory {
  id: string;
  name: string;
  commercial_registration: string;
  city: string;
  region: string;
  industry_type: IndustryType;
  employee_count: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  logo_url?: string;
  status: FactoryStatus;
  rating: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export type FactoryStatus = 'pending' | 'verified' | 'suspended';

export type IndustryType = 
  | 'metals'
  | 'plastics'
  | 'chemicals'
  | 'food'
  | 'textiles'
  | 'electronics'
  | 'construction'
  | 'packaging'
  | 'other';

export const INDUSTRY_LABELS: Record<IndustryType, string> = {
  metals: 'المعادن والتصنيع',
  plastics: 'البلاستيك والبوليمرات',
  chemicals: 'الكيماويات',
  food: 'الصناعات الغذائية',
  textiles: 'المنسوجات',
  electronics: 'الإلكترونيات',
  construction: 'مواد البناء',
  packaging: 'التعبئة والتغليف',
  other: 'أخرى'
};

// ========== تسجيل المصنع (Onboarding) ==========

export type OnboardingStatus = 'pending' | 'in_progress' | 'submitted' | 'verified' | 'rejected';

export const ONBOARDING_STATUS_LABELS: Record<OnboardingStatus, string> = {
  pending: 'في الانتظار',
  in_progress: 'قيد التسجيل',
  submitted: 'تم الإرسال',
  verified: 'موثق',
  rejected: 'مرفوض',
};

export type DocumentType =
  | 'commercial_register'
  | 'industrial_license'
  | 'saso_certificate'
  | 'vat_certificate'
  | 'municipal_license'
  | 'chamber_membership'
  | 'other';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  commercial_register: 'السجل التجاري',
  industrial_license: 'الرخصة الصناعية',
  saso_certificate: 'شهادة ساسو',
  vat_certificate: 'شهادة ضريبة القيمة المضافة',
  municipal_license: 'رخصة البلدية',
  chamber_membership: 'عضوية الغرفة التجارية',
  other: 'مستند آخر',
};

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  pending: 'قيد المراجعة',
  verified: 'موثق',
  rejected: 'مرفوض',
  expired: 'منتهي الصلاحية',
};

export interface FactoryDocument {
  id: string;
  factoryId: string;
  documentType: DocumentType;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: DocumentStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FactoryCapability {
  id: string;
  factoryId: string;
  category: IndustryType;
  subcategory?: string;
  description?: string;
  hasEquipment: boolean;
  equipmentCount?: number;
  monthlyCapacity?: string;
  capacityUnit?: string;
  certifications?: string[];
  createdAt: string;
}

export interface OnboardingFormData {
  // Step 1: Basic Info
  factoryName: string;
  factoryNameEn?: string;
  commercialRegisterNumber: string;
  vatNumber?: string;
  establishedYear?: number;
  employeeCount?: number;

  // Step 2: Location & Contact
  city: string;
  district: string;
  street: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  contactEmail: string;
  website?: string;

  // Step 3: Capabilities
  categories: IndustryType[];
  capabilities: Partial<FactoryCapability>[];
  description: string;

  // Step 4: Documents
  documents: Partial<FactoryDocument>[];
}

// Full list of Saudi cities for dropdown
export const SAUDI_CITIES = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'الظهران',
  'الجبيل',
  'ينبع',
  'تبوك',
  'بريدة',
  'خميس مشيط',
  'الطائف',
  'نجران',
  'جازان',
  'أبها',
  'حائل',
  'الأحساء',
  'القطيف',
  'سكاكا',
  'عرعر',
  'الباحة',
  'بيشة',
  'القنفذة',
  'رابغ',
  'الخرج',
  'عنيزة',
  'حفر الباطن',
  'الزلفي',
  'شقراء',
] as const;

export type SaudiCityName = (typeof SAUDI_CITIES)[number];

// ========== الشراء الجماعي ==========
export interface GroupBuyingOrder {
  id: string;
  title: string;
  description: string;
  material_type: MaterialType;
  material_specs: string;
  target_quantity: number;
  current_quantity: number;
  unit: string;
  target_price_per_unit: number; // بالهللات
  market_price_per_unit: number; // بالهللات
  min_participants: number;
  current_participants: number;
  deadline: string;
  status: OrderStatus;
  supplier_id?: string;
  creator_factory_id: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'draft'
  | 'open'
  | 'collecting'
  | 'negotiating'
  | 'ordered'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'مسودة',
  open: 'مفتوح للانضمام',
  collecting: 'جاري التجميع',
  negotiating: 'التفاوض مع الموردين',
  ordered: 'تم الطلب',
  shipping: 'قيد الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي'
};

export type MaterialType = 
  | 'aluminum'
  | 'steel'
  | 'copper'
  | 'plastic_pellets'
  | 'chemicals'
  | 'packaging'
  | 'raw_materials'
  | 'other';

export const MATERIAL_LABELS: Record<MaterialType, string> = {
  aluminum: 'ألومنيوم',
  steel: 'حديد وصلب',
  copper: 'نحاس',
  plastic_pellets: 'حبيبات بلاستيك',
  chemicals: 'مواد كيميائية',
  packaging: 'مواد تعبئة',
  raw_materials: 'مواد خام',
  other: 'أخرى'
};

// ========== المشاركة في الطلب ==========
export interface OrderParticipation {
  id: string;
  order_id: string;
  factory_id: string;
  quantity: number;
  status: ParticipationStatus;
  joined_at: string;
  factory?: Factory;
}

export type ParticipationStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled';

// ========== تبادل الطاقة الإنتاجية ==========
export interface Equipment {
  id: string;
  factory_id: string;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  year: number;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  hourly_rate: number; // بالهللات
  daily_rate: number; // بالهللات
  weekly_rate: number; // بالهللات
  min_rental_hours: number;
  status: EquipmentStatus;
  rating: number;
  total_rentals: number;
  location: string;
  available_from?: string;
  available_until?: string;
  created_at: string;
  updated_at: string;
  factory?: Factory;
}

export type EquipmentType = 
  | 'cnc_machine'
  | 'lathe'
  | 'press'
  | 'welding'
  | 'cutting'
  | 'molding'
  | 'packaging'
  | 'testing'
  | 'forklift'
  | 'crane'
  | 'other';

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  cnc_machine: 'ماكينة CNC',
  lathe: 'مخرطة',
  press: 'مكبس',
  welding: 'معدات لحام',
  cutting: 'معدات قطع',
  molding: 'قوالب وتشكيل',
  packaging: 'معدات تعبئة',
  testing: 'أجهزة فحص',
  forklift: 'رافعة شوكية',
  crane: 'رافعة',
  other: 'أخرى'
};

export type EquipmentStatus = 'available' | 'rented' | 'maintenance' | 'unavailable';

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  available: 'متاح',
  rented: 'مؤجر حالياً',
  maintenance: 'صيانة',
  unavailable: 'غير متاح'
};

// ========== حجز المعدات ==========
export interface EquipmentBooking {
  id: string;
  equipment_id: string;
  renter_factory_id: string;
  start_date: string;
  end_date: string;
  total_hours: number;
  total_amount: number; // بالهللات
  status: BookingStatus;
  notes?: string;
  created_at: string;
  equipment?: Equipment;
  renter_factory?: Factory;
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'في انتظار الموافقة',
  confirmed: 'مؤكد',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي'
};

// ========== الموردون ==========
export interface Supplier {
  id: string;
  name: string;
  type: 'manufacturer' | 'distributor' | 'importer';
  materials: MaterialType[];
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  website?: string;
  rating: number;
  total_orders: number;
  verified: boolean;
  created_at: string;
}

// ========== الإشعارات ==========
export interface Notification {
  id: string;
  factory_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export type NotificationType = 
  | 'order_update'
  | 'new_participant'
  | 'booking_request'
  | 'booking_confirmed'
  | 'payment_received'
  | 'system';

// ========== الإحصائيات ==========
export interface DashboardStats {
  active_orders: number;
  total_savings: number; // بالهللات
  active_equipment: number;
  pending_bookings: number;
  monthly_revenue: number; // بالهللات
  participation_rate: number;
}

// ========== التقييمات ==========
export interface Review {
  id: string;
  reviewer_factory_id: string;
  target_type: 'factory' | 'equipment' | 'supplier';
  target_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_factory?: Factory;
}

// ========== Helper Types ==========
export type SaudiCity = 
  | 'riyadh'
  | 'jeddah'
  | 'dammam'
  | 'makkah'
  | 'madinah'
  | 'khobar'
  | 'jubail'
  | 'yanbu'
  | 'tabuk'
  | 'other';

export const CITY_LABELS: Record<SaudiCity, string> = {
  riyadh: 'الرياض',
  jeddah: 'جدة',
  dammam: 'الدمام',
  makkah: 'مكة المكرمة',
  madinah: 'المدينة المنورة',
  khobar: 'الخبر',
  jubail: 'الجبيل',
  yanbu: 'ينبع',
  tabuk: 'تبوك',
  other: 'أخرى'
};

// ========== API Response Types ==========
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ========== Machine Listing (Capacity Exchange) ==========
export type MachineStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';

export type MachineCategory = 'CNC' | 'PRESS' | 'WELDING' | 'CUTTING' | 'OTHER';

export interface MachineListing {
  id: string;
  name: string;
  description: string;
  category: MachineCategory;
  imageUrl?: string;
  status: MachineStatus;
  location: { city: string; district?: string };
  rating: number;
  reviewCount: number;
  pricing: {
    hourly?: number;
    daily?: number;
    weekly?: number;
    currency: string;
  };
  owner: { name: string; verified: boolean };
  availableFrom: string; // ISO Date
}

export const MACHINE_STATUS_LABELS: Record<MachineStatus, string> = {
  AVAILABLE: 'متاح',
  RENTED: 'مؤجر حالياً',
  MAINTENANCE: 'صيانة',
};

export const MACHINE_CATEGORY_LABELS: Record<MachineCategory, string> = {
  CNC: 'CNC',
  PRESS: 'مكابس',
  WELDING: 'لحام',
  CUTTING: 'قطع',
  OTHER: 'أخرى',
};

// ========== نظام التعاقد من الباطن (Subcontracting) ==========

export type ContractType = 'hourly' | 'shift' | 'unit' | 'project';

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  hourly: 'بالساعة',
  shift: 'بالوردية',
  unit: 'بالقطعة',
  project: 'بالمشروع',
};

export interface PricingModel {
  type: ContractType;
  hourlyRate?: number;      // ر.س./ساعة (بالهللات)
  shiftRate?: number;       // ر.س./وردية (بالهللات)
  unitRate?: number;        // ر.س./قطعة (بالهللات)
  projectMinimum?: number;  // الحد الأدنى للمشروع (بالهللات)
  currency: 'SAR';
}

export interface ShiftAvailability {
  morning: boolean;    // 6AM - 2PM
  evening: boolean;    // 2PM - 10PM
  night: boolean;      // 10PM - 6AM
}

export interface OperatorOption {
  available: boolean;
  included: boolean;
  operatorRate?: number;  // تكلفة إضافية (بالهللات)
  requiredCertifications?: string[];
}

export interface EquipmentSpecifications {
  maxDimensions?: string;
  maxWeight?: string;
  tolerance?: string;
  materials?: string[];
  certifications?: string[];
}

export interface EquipmentCapacity {
  unitsPerHour?: number;
  unitsPerShift?: number;
  maxBatchSize?: number;
}

export interface EquipmentAvailability {
  shifts: ShiftAvailability;
  leadTimeDays: number;
  minContractDays?: number;
}

export type EquipmentCapabilityStatus = 'available' | 'busy' | 'maintenance';

export const EQUIPMENT_CAPABILITY_STATUS_LABELS: Record<EquipmentCapabilityStatus, string> = {
  available: 'متاح',
  busy: 'مشغول',
  maintenance: 'صيانة',
};

export interface EquipmentCapability {
  id: string;
  factoryId: string;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  year: number;
  description: string;
  images: string[];
  specifications: EquipmentSpecifications;
  capacity: EquipmentCapacity;
  pricing: PricingModel[];
  availability: EquipmentAvailability;
  operator: OperatorOption;
  location: string;
  city: string;
  status: EquipmentCapabilityStatus;
  rating: number;
  completedJobs: number;
  ownerName: string;
  ownerVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========== نظام طلب عروض الأسعار (RFQ) ==========

export type RFQStatus = 'draft' | 'submitted' | 'quoted' | 'accepted' | 'rejected' | 'expired';

export const RFQ_STATUS_LABELS: Record<RFQStatus, string> = {
  draft: 'مسودة',
  submitted: 'تم الإرسال',
  quoted: 'تم التسعير',
  accepted: 'مقبول',
  rejected: 'مرفوض',
  expired: 'منتهي الصلاحية',
};

export type ShiftPreference = 'morning' | 'evening' | 'night';

export interface RFQRequest {
  id: string;
  requesterId: string;
  equipmentId: string;
  supplierId: string;

  // تفاصيل العمل
  jobType: ContractType;
  jobDescription: string;

  // للتعاقد بالقطعة
  quantity?: number;
  unitType?: string;

  // للتعاقد بالوردية
  shiftsNeeded?: number;
  preferredShifts?: ShiftPreference[];

  // للتعاقد بالمشروع
  projectScope?: string;
  estimatedDuration?: string;

  // المتطلبات التقنية
  material?: string;
  dimensions?: string;
  toleranceRequired?: string;

  // المرفقات
  technicalDrawings?: string[];
  sampleImages?: string[];
  specifications?: string;

  // الخدمات اللوجستية
  needsOperator: boolean;
  deliveryRequired: boolean;
  deliveryAddress?: string;

  // الجدول الزمني
  preferredStartDate: string;
  deadline: string;

  // ملاحظات
  additionalNotes?: string;

  // الحالة والرد
  status: RFQStatus;
  quotedPrice?: number;
  quotedLeadTime?: string;
  supplierNotes?: string;

  // التواريخ
  createdAt: string;
  quotedAt?: string;
  respondedAt?: string;
  expiresAt: string;
}

// ========== نظام الشراء الاستراتيجي (Strategic Procurement) ==========

export type DealStatus =
  | 'draft'              // مسودة
  | 'open'               // مفتوحة للانضمام
  | 'aggregating'        // جاري التجميع
  | 'pending_commitment' // في انتظار الالتزام
  | 'rfq_open'           // طلب عروض أسعار مفتوح
  | 'evaluating_bids'    // تقييم العروض
  | 'awarded'            // تم الترسية
  | 'in_production'      // قيد التصنيع
  | 'shipping'           // قيد الشحن
  | 'delivered'          // تم التسليم
  | 'completed'          // مكتمل
  | 'cancelled';         // ملغي

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  draft: 'مسودة',
  open: 'مفتوحة للانضمام',
  aggregating: 'جاري التجميع',
  pending_commitment: 'في انتظار الالتزام',
  rfq_open: 'طلب عروض أسعار',
  evaluating_bids: 'تقييم العروض',
  awarded: 'تم الترسية',
  in_production: 'قيد التصنيع',
  shipping: 'قيد الشحن',
  delivered: 'تم التسليم',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  open: 'bg-emerald-100 text-emerald-700',
  aggregating: 'bg-blue-100 text-blue-700',
  pending_commitment: 'bg-amber-100 text-amber-700',
  rfq_open: 'bg-purple-100 text-purple-700',
  evaluating_bids: 'bg-indigo-100 text-indigo-700',
  awarded: 'bg-teal-100 text-teal-700',
  in_production: 'bg-orange-100 text-orange-700',
  shipping: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export type DealParticipationStatus =
  | 'interested'     // مهتم
  | 'committed'      // ملتزم
  | 'escrow_pending' // في انتظار الضمان
  | 'escrow_paid'    // تم دفع الضمان
  | 'confirmed'      // مؤكد
  | 'fulfilled'      // تم التنفيذ
  | 'withdrawn';     // انسحب

export const DEAL_PARTICIPATION_STATUS_LABELS: Record<DealParticipationStatus, string> = {
  interested: 'مهتم',
  committed: 'ملتزم',
  escrow_pending: 'في انتظار الضمان',
  escrow_paid: 'تم دفع الضمان',
  confirmed: 'مؤكد',
  fulfilled: 'تم التنفيذ',
  withdrawn: 'انسحب',
};

export type BidStatus =
  | 'draft'        // مسودة
  | 'submitted'    // تم التقديم
  | 'under_review' // قيد المراجعة
  | 'shortlisted'  // في القائمة المختصرة
  | 'awarded'      // فائز
  | 'rejected'     // مرفوض
  | 'withdrawn';   // تم السحب

export const BID_STATUS_LABELS: Record<BidStatus, string> = {
  draft: 'مسودة',
  submitted: 'تم التقديم',
  under_review: 'قيد المراجعة',
  shortlisted: 'في القائمة المختصرة',
  awarded: 'فائز',
  rejected: 'مرفوض',
  withdrawn: 'تم السحب',
};

export type Incoterm = 'EXW' | 'FCA' | 'FOB' | 'CIF' | 'DDP' | 'DAP';

export const INCOTERM_LABELS: Record<Incoterm, string> = {
  EXW: 'تسليم المصنع (EXW)',
  FCA: 'الناقل الحر (FCA)',
  FOB: 'على ظهر السفينة (FOB)',
  CIF: 'التكلفة والتأمين والشحن (CIF)',
  DDP: 'التسليم مع الرسوم (DDP)',
  DAP: 'التسليم في المكان (DAP)',
};

// شريحة التسعير
export interface PricingTier {
  id: string;
  dealId: string;
  tierIndex: number;
  tierLabel: string;
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit: number; // بالهللات
  discountPercentage: number;
  isActive: boolean;
}

// المواصفات الفنية
export interface TechnicalSpec {
  id: string;
  dealId: string;
  category: 'dimensions' | 'chemical' | 'mechanical' | 'surface' | 'other';
  specName: string;
  specValue: string;
  unit?: string;
  tolerance?: string;
  isMandatory: boolean;
  verificationMethod?: 'certificate' | 'sample_test' | 'visual';
  sortOrder: number;
}

export const SPEC_CATEGORY_LABELS: Record<TechnicalSpec['category'], string> = {
  dimensions: 'الأبعاد',
  chemical: 'التركيب الكيميائي',
  mechanical: 'الخواص الميكانيكية',
  surface: 'المعالجة السطحية',
  other: 'أخرى',
};

// متطلبات الشهادات
export interface CertificationRequirement {
  id: string;
  dealId: string;
  certificationType: string;
  certificationBody?: string;
  isMandatory: boolean;
  documentUrl?: string;
}

// مشاركة المصنع في الصفقة
export interface DealParticipation {
  id: string;
  dealId: string;
  factoryId: string;
  quantity: number;
  deliveryPreference: 'individual' | 'consolidated';
  deliveryAddress?: string;
  deliveryIncoterm?: Incoterm;
  escrowAmount?: number;
  escrowPaidAt?: string;
  escrowTransactionId?: string;
  poNumber?: string;
  poDocumentUrl?: string;
  poSubmittedAt?: string;
  status: DealParticipationStatus;
  notes?: string;
  joinedAt: string;
  committedAt?: string;
  confirmedAt?: string;
  fulfilledAt?: string;
  withdrawnAt?: string;
  factory?: Factory;
}

// عرض المورد
export interface SupplierBid {
  id: string;
  dealId: string;
  supplierId: string;
  pricePerUnit: number; // بالهللات
  totalCapacity?: number;
  leadTimeDays: number;
  incoterm: Incoterm;
  deliveryLocation?: string;
  paymentTerms?: string;
  technicalProposalUrl?: string;
  commercialProposalUrl?: string;
  sampleAvailable: boolean;
  validUntil?: string;
  status: BidStatus;
  notes?: string;
  createdAt: string;
  submittedAt?: string;
  updatedAt: string;
  supplier?: Supplier;
  evaluation?: BidEvaluation;
}

// تقييم العرض
export interface BidEvaluation {
  id: string;
  bidId: string;
  evaluatorFactoryId?: string;
  priceScore: number;
  qualityScore: number;
  deliveryScore: number;
  complianceScore: number;
  priceWeight: number;
  qualityWeight: number;
  deliveryWeight: number;
  complianceWeight: number;
  weightedScore: number;
  comments?: string;
  evaluatedAt: string;
}

// الصفقة الكاملة
export interface ProcurementDeal {
  id: string;
  title: string;
  description?: string;
  materialType: MaterialType;
  materialSpecs: Record<string, unknown>;
  minQuantity: number;
  maxQuantity?: number;
  currentQuantity: number;
  unit: string;
  marketPricePerUnit: number; // بالهللات
  escrowPercentage: number;
  escrowReleaseOnDelivery: boolean;
  deliveryTerms: Incoterm;
  deliveryLocation?: string;
  estimatedDeliveryDays?: number;
  aggregationDeadline?: string;
  commitmentDeadline?: string;
  rfqDeadline?: string;
  creatorFactoryId?: string;
  status: DealStatus;
  category?: string;
  tags?: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  awardedAt?: string;
  completedAt?: string;
  // العلاقات
  pricingTiers: PricingTier[];
  specifications: TechnicalSpec[];
  certifications: CertificationRequirement[];
  participations: DealParticipation[];
  bids: SupplierBid[];
  creatorFactory?: Factory;
}

// بيانات العرض للمجمّع الذكي
export interface AggregatorDisplayData {
  deal: ProcurementDeal;
  currentTier: PricingTier | null;
  nextTier: PricingTier | null;
  quantityToNextTier: number;
  currentPricePerUnit: number;
  bestPricePerUnit: number;
  totalSavingsPercentage: number;
  currentSavingsPercentage: number;
  progressPercentage: number;
  participantCount: number;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
  } | null;
  isDeadlinePassed: boolean;
  userParticipation?: DealParticipation;
}

// ========== نظام الإدارة (Admin) ==========

export interface AdminStats {
  totalFactories: number;
  pendingFactories: number;
  verifiedFactories: number;
  rejectedFactories: number;
  totalDeals: number;
  activeDeals: number;
  completedDeals: number;
  totalEquipment: number;
  availableEquipment: number;
  totalUsers: number;
  activeUsers: number;
  totalSavings: number;
  totalTransactions: number;
}

export type AdminLogTargetType = 'factory' | 'deal' | 'user' | 'document' | 'setting';

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType: AdminLogTargetType;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export const ADMIN_ACTION_LABELS: Record<string, string> = {
  approve_factory: 'الموافقة على مصنع',
  reject_factory: 'رفض مصنع',
  suspend_factory: 'تعليق مصنع',
  verify_document: 'توثيق مستند',
  reject_document: 'رفض مستند',
  update_setting: 'تحديث إعداد',
  close_deal: 'إغلاق صفقة',
  cancel_deal: 'إلغاء صفقة',
};

export interface PendingFactory {
  id: string;
  name: string;
  commercialRegister: string;
  city: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  submittedAt: string;
  documents: FactoryDocument[];
  capabilities: FactoryCapability[];
}

// Factory category labels (for capabilities display)
export const FACTORY_CATEGORY_LABELS: Record<IndustryType, string> = {
  metals: 'المعادن والتصنيع',
  plastics: 'البلاستيك والبوليمرات',
  chemicals: 'الكيماويات',
  food: 'الصناعات الغذائية',
  textiles: 'المنسوجات',
  electronics: 'الإلكترونيات',
  construction: 'مواد البناء',
  packaging: 'التعبئة والتغليف',
  other: 'أخرى',
};
