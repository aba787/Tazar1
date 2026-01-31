-- =====================================
-- 🏭 Strategic Procurement System v2.0
-- Migration: 002_strategic_procurement.sql
-- =====================================

-- ========== ENUMS ==========

-- حالات الصفقة
CREATE TYPE deal_status AS ENUM (
  'draft',              -- مسودة
  'open',               -- مفتوحة للانضمام
  'aggregating',        -- جاري التجميع
  'pending_commitment', -- في انتظار الالتزام
  'rfq_open',           -- طلب عروض أسعار مفتوح
  'evaluating_bids',    -- تقييم العروض
  'awarded',            -- تم الترسية
  'in_production',      -- قيد التصنيع
  'shipping',           -- قيد الشحن
  'delivered',          -- تم التسليم
  'completed',          -- مكتمل
  'cancelled'           -- ملغي
);

-- حالات المشاركة
CREATE TYPE participation_status AS ENUM (
  'interested',     -- مهتم
  'committed',      -- ملتزم
  'escrow_pending', -- في انتظار الضمان
  'escrow_paid',    -- تم دفع الضمان
  'confirmed',      -- مؤكد
  'fulfilled',      -- تم التنفيذ
  'withdrawn'       -- انسحب
);

-- حالات العرض
CREATE TYPE bid_status AS ENUM (
  'draft',        -- مسودة
  'submitted',    -- تم التقديم
  'under_review', -- قيد المراجعة
  'shortlisted',  -- في القائمة المختصرة
  'awarded',      -- فائز
  'rejected',     -- مرفوض
  'withdrawn'     -- تم السحب
);

-- شروط التسليم الدولية
CREATE TYPE incoterm AS ENUM (
  'EXW', -- تسليم المصنع
  'FCA', -- الناقل الحر
  'FOB', -- التسليم على ظهر السفينة
  'CIF', -- التكلفة والتأمين والشحن
  'DDP', -- التسليم مع دفع الرسوم
  'DAP'  -- التسليم في المكان
);

-- ========== TABLES ==========

-- 1. جدول الصفقات
CREATE TABLE procurement_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- المعلومات الأساسية
  title VARCHAR(255) NOT NULL,
  description TEXT,
  material_type VARCHAR(50) NOT NULL,
  material_specs JSONB DEFAULT '{}',

  -- الكميات
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  current_quantity INTEGER DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'طن',

  -- التسعير المرجعي
  market_price_per_unit INTEGER NOT NULL, -- بالهللات

  -- إعدادات الضمان
  escrow_percentage DECIMAL(5,2) DEFAULT 10.00,
  escrow_release_on_delivery BOOLEAN DEFAULT true,

  -- شروط التسليم
  delivery_terms incoterm DEFAULT 'DDP',
  delivery_location VARCHAR(255),
  estimated_delivery_days INTEGER,

  -- المواعيد
  aggregation_deadline TIMESTAMP WITH TIME ZONE,
  commitment_deadline TIMESTAMP WITH TIME ZONE,
  rfq_deadline TIMESTAMP WITH TIME ZONE,

  -- المنشئ
  creator_factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,

  -- الحالة
  status deal_status DEFAULT 'draft',

  -- البيانات الوصفية
  category VARCHAR(50),
  tags TEXT[],
  featured BOOLEAN DEFAULT false,

  -- التواريخ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  awarded_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. جدول شرائح التسعير
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES procurement_deals(id) ON DELETE CASCADE,

  tier_index INTEGER NOT NULL, -- 0, 1, 2, 3...
  tier_label VARCHAR(50), -- "الشريحة الأساسية", "الشريحة الفضية"...

  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER, -- NULL = unlimited

  price_per_unit INTEGER NOT NULL, -- بالهللات
  discount_percentage DECIMAL(5,2) NOT NULL,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(deal_id, tier_index)
);

-- 3. جدول المشاركات في الصفقة
CREATE TABLE deal_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES procurement_deals(id) ON DELETE CASCADE,
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,

  -- الكمية المطلوبة
  quantity INTEGER NOT NULL,

  -- تفضيلات التسليم
  delivery_preference VARCHAR(20) DEFAULT 'individual', -- individual, consolidated
  delivery_address TEXT,
  delivery_incoterm incoterm,

  -- بيانات الضمان
  escrow_amount INTEGER, -- بالهللات
  escrow_paid_at TIMESTAMP WITH TIME ZONE,
  escrow_transaction_id VARCHAR(100),

  -- بيانات أمر الشراء
  po_number VARCHAR(100),
  po_document_url TEXT,
  po_submitted_at TIMESTAMP WITH TIME ZONE,

  -- الحالة
  status participation_status DEFAULT 'interested',

  -- ملاحظات
  notes TEXT,

  -- التواريخ
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  committed_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(deal_id, factory_id)
);

-- 4. جدول المواصفات الفنية
CREATE TABLE deal_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES procurement_deals(id) ON DELETE CASCADE,

  category VARCHAR(50) NOT NULL, -- 'dimensions', 'chemical', 'mechanical', 'surface', 'other'
  spec_name VARCHAR(100) NOT NULL,
  spec_value VARCHAR(255) NOT NULL,
  unit VARCHAR(50),
  tolerance VARCHAR(50), -- e.g., "±0.5mm"

  is_mandatory BOOLEAN DEFAULT true,
  verification_method VARCHAR(100), -- 'certificate', 'sample_test', 'visual'

  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. جدول الشهادات المطلوبة
CREATE TABLE deal_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES procurement_deals(id) ON DELETE CASCADE,

  certification_type VARCHAR(100) NOT NULL, -- 'ISO 9001', 'SASO', 'ASTM A36'
  certification_body VARCHAR(100), -- الجهة المانحة

  is_mandatory BOOLEAN DEFAULT true,
  document_url TEXT, -- نموذج الشهادة المطلوبة

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. جدول عروض الموردين
CREATE TABLE supplier_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES procurement_deals(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  -- التسعير
  price_per_unit INTEGER NOT NULL, -- بالهللات
  total_capacity INTEGER, -- الكمية القصوى المتاحة

  -- شروط التسليم
  lead_time_days INTEGER NOT NULL,
  incoterm incoterm NOT NULL,
  delivery_location VARCHAR(255),

  -- شروط الدفع
  payment_terms VARCHAR(100), -- '30% مقدم، 70% عند التسليم'

  -- المرفقات
  technical_proposal_url TEXT,
  commercial_proposal_url TEXT,
  sample_available BOOLEAN DEFAULT false,

  -- الصلاحية
  valid_until TIMESTAMP WITH TIME ZONE,

  -- الحالة
  status bid_status DEFAULT 'draft',

  -- ملاحظات
  notes TEXT,

  -- التواريخ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(deal_id, supplier_id)
);

-- 7. جدول تقييم العروض
CREATE TABLE bid_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES supplier_bids(id) ON DELETE CASCADE,
  evaluator_factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,

  -- الدرجات (من 100)
  price_score INTEGER CHECK (price_score >= 0 AND price_score <= 100),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  delivery_score INTEGER CHECK (delivery_score >= 0 AND delivery_score <= 100),
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),

  -- الأوزان (النسب المئوية)
  price_weight DECIMAL(5,2) DEFAULT 40.00,
  quality_weight DECIMAL(5,2) DEFAULT 25.00,
  delivery_weight DECIMAL(5,2) DEFAULT 20.00,
  compliance_weight DECIMAL(5,2) DEFAULT 15.00,

  -- الدرجة الموزونة
  weighted_score DECIMAL(6,2) GENERATED ALWAYS AS (
    (price_score * price_weight / 100) +
    (quality_score * quality_weight / 100) +
    (delivery_score * delivery_weight / 100) +
    (compliance_score * compliance_weight / 100)
  ) STORED,

  -- ملاحظات
  comments TEXT,

  -- التواريخ
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(bid_id, evaluator_factory_id)
);

-- ========== INDEXES ==========

CREATE INDEX idx_procurement_deals_status ON procurement_deals(status);
CREATE INDEX idx_procurement_deals_category ON procurement_deals(category);
CREATE INDEX idx_procurement_deals_creator ON procurement_deals(creator_factory_id);
CREATE INDEX idx_procurement_deals_deadline ON procurement_deals(aggregation_deadline);

CREATE INDEX idx_pricing_tiers_deal ON pricing_tiers(deal_id);
CREATE INDEX idx_pricing_tiers_quantity ON pricing_tiers(min_quantity, max_quantity);

CREATE INDEX idx_deal_participations_deal ON deal_participations(deal_id);
CREATE INDEX idx_deal_participations_factory ON deal_participations(factory_id);
CREATE INDEX idx_deal_participations_status ON deal_participations(status);

CREATE INDEX idx_deal_specifications_deal ON deal_specifications(deal_id);
CREATE INDEX idx_deal_certifications_deal ON deal_certifications(deal_id);

CREATE INDEX idx_supplier_bids_deal ON supplier_bids(deal_id);
CREATE INDEX idx_supplier_bids_supplier ON supplier_bids(supplier_id);
CREATE INDEX idx_supplier_bids_status ON supplier_bids(status);

CREATE INDEX idx_bid_evaluations_bid ON bid_evaluations(bid_id);

-- ========== FUNCTIONS ==========

-- دالة لجلب شريحة التسعير الحالية بناءً على الكمية
CREATE OR REPLACE FUNCTION get_current_pricing_tier(deal_uuid UUID)
RETURNS TABLE (
  tier_id UUID,
  tier_index INTEGER,
  tier_label VARCHAR(50),
  price_per_unit INTEGER,
  discount_percentage DECIMAL(5,2)
) AS $$
DECLARE
  current_qty INTEGER;
BEGIN
  -- جلب الكمية الحالية
  SELECT current_quantity INTO current_qty
  FROM procurement_deals
  WHERE id = deal_uuid;

  -- جلب الشريحة المناسبة
  RETURN QUERY
  SELECT
    pt.id,
    pt.tier_index,
    pt.tier_label,
    pt.price_per_unit,
    pt.discount_percentage
  FROM pricing_tiers pt
  WHERE pt.deal_id = deal_uuid
    AND pt.is_active = true
    AND pt.min_quantity <= current_qty
    AND (pt.max_quantity IS NULL OR pt.max_quantity >= current_qty)
  ORDER BY pt.tier_index DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- دالة لحساب مبلغ الضمان
CREATE OR REPLACE FUNCTION calculate_escrow_amount(
  deal_uuid UUID,
  quantity INTEGER
) RETURNS INTEGER AS $$
DECLARE
  tier_price INTEGER;
  escrow_pct DECIMAL(5,2);
  total_amount INTEGER;
BEGIN
  -- جلب سعر الشريحة الحالية
  SELECT price_per_unit INTO tier_price
  FROM get_current_pricing_tier(deal_uuid);

  -- جلب نسبة الضمان
  SELECT escrow_percentage INTO escrow_pct
  FROM procurement_deals
  WHERE id = deal_uuid;

  -- حساب المبلغ
  total_amount := (tier_price * quantity * escrow_pct / 100)::INTEGER;

  RETURN total_amount;
END;
$$ LANGUAGE plpgsql;

-- ========== TRIGGERS ==========

-- تحديث الكمية الحالية عند تغيير المشاركات
CREATE OR REPLACE FUNCTION update_deal_quantity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE procurement_deals
  SET
    current_quantity = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM deal_participations
      WHERE deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
        AND status NOT IN ('withdrawn', 'interested')
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.deal_id, OLD.deal_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_deal_quantity
AFTER INSERT OR UPDATE OR DELETE ON deal_participations
FOR EACH ROW EXECUTE FUNCTION update_deal_quantity();

-- تحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deals_updated_at
BEFORE UPDATE ON procurement_deals
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_bids_updated_at
BEFORE UPDATE ON supplier_bids
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========== RLS POLICIES ==========

ALTER TABLE procurement_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_evaluations ENABLE ROW LEVEL SECURITY;

-- سياسات الصفقات (قراءة للجميع، تعديل للمنشئ)
CREATE POLICY "Deals are viewable by everyone" ON procurement_deals
  FOR SELECT USING (status != 'draft' OR creator_factory_id = auth.uid()::UUID);

CREATE POLICY "Deals can be created by authenticated users" ON procurement_deals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Deals can be updated by creator" ON procurement_deals
  FOR UPDATE USING (creator_factory_id = auth.uid()::UUID);

-- سياسات شرائح التسعير
CREATE POLICY "Pricing tiers are viewable with deals" ON pricing_tiers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM procurement_deals pd
      WHERE pd.id = pricing_tiers.deal_id
        AND (pd.status != 'draft' OR pd.creator_factory_id = auth.uid()::UUID)
    )
  );

CREATE POLICY "Pricing tiers can be managed by deal creator" ON pricing_tiers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM procurement_deals pd
      WHERE pd.id = pricing_tiers.deal_id
        AND pd.creator_factory_id = auth.uid()::UUID
    )
  );

-- سياسات المشاركات
CREATE POLICY "Participations viewable by deal participants" ON deal_participations
  FOR SELECT USING (
    factory_id = auth.uid()::UUID OR
    EXISTS (
      SELECT 1 FROM procurement_deals pd
      WHERE pd.id = deal_participations.deal_id
        AND pd.creator_factory_id = auth.uid()::UUID
    )
  );

CREATE POLICY "Factories can manage their own participations" ON deal_participations
  FOR ALL USING (factory_id = auth.uid()::UUID);

-- سياسات المواصفات والشهادات (قراءة للجميع)
CREATE POLICY "Specifications are viewable" ON deal_specifications
  FOR SELECT USING (true);

CREATE POLICY "Certifications are viewable" ON deal_certifications
  FOR SELECT USING (true);

-- سياسات عروض الموردين
CREATE POLICY "Submitted bids are viewable" ON supplier_bids
  FOR SELECT USING (
    status != 'draft' OR supplier_id = auth.uid()::UUID
  );

CREATE POLICY "Suppliers can manage their bids" ON supplier_bids
  FOR ALL USING (supplier_id = auth.uid()::UUID);

-- سياسات التقييمات
CREATE POLICY "Evaluations viewable by evaluators and deal participants" ON bid_evaluations
  FOR SELECT USING (
    evaluator_factory_id = auth.uid()::UUID OR
    EXISTS (
      SELECT 1 FROM supplier_bids sb
      JOIN procurement_deals pd ON pd.id = sb.deal_id
      WHERE sb.id = bid_evaluations.bid_id
        AND pd.creator_factory_id = auth.uid()::UUID
    )
  );

CREATE POLICY "Evaluations can be created by participants" ON bid_evaluations
  FOR INSERT WITH CHECK (evaluator_factory_id = auth.uid()::UUID);

-- ========== SAMPLE DATA (Optional - for development) ==========

-- Insert sample pricing tier structure comment for reference:
-- شريحة 1: 1-50 طن -> 5500 ريال/طن (0% خصم)
-- شريحة 2: 51-100 طن -> 5225 ريال/طن (5% خصم)
-- شريحة 3: 101-200 طن -> 4950 ريال/طن (10% خصم)
-- شريحة 4: 201+ طن -> 4675 ريال/طن (15% خصم)
