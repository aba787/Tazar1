-- =============================================
-- FACTORY ONBOARDING SYSTEM
-- Migration: 003_factory_onboarding.sql
-- =============================================

-- =============================================
-- 1. UPDATE FACTORIES TABLE WITH ONBOARDING FIELDS
-- =============================================

-- Onboarding status and step tracking
ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  onboarding_status VARCHAR(20) DEFAULT 'pending';

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  onboarding_step INTEGER DEFAULT 1;

-- Timestamps for verification workflow
ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  submitted_at TIMESTAMPTZ;

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  verified_at TIMESTAMPTZ;

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  rejected_at TIMESTAMPTZ;

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  rejection_reason TEXT;

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  verified_by UUID;

-- Additional factory details for onboarding
ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  name_en VARCHAR(255);

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  vat_number VARCHAR(15);

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  established_year INTEGER;

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  district VARCHAR(255);

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  address TEXT;

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  postal_code VARCHAR(10);

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  latitude DECIMAL(10, 8);

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  longitude DECIMAL(11, 8);

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  phone VARCHAR(20);

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  email VARCHAR(255);

ALTER TABLE public.factories ADD COLUMN IF NOT EXISTS
  website TEXT;

-- Add constraint for onboarding_status
ALTER TABLE public.factories DROP CONSTRAINT IF EXISTS factories_onboarding_status_check;
ALTER TABLE public.factories ADD CONSTRAINT factories_onboarding_status_check
  CHECK (onboarding_status IN ('pending', 'in_progress', 'submitted', 'verified', 'rejected'));

-- Index for onboarding status queries
CREATE INDEX IF NOT EXISTS idx_factories_onboarding_status ON public.factories(onboarding_status);

-- =============================================
-- 2. FACTORY DOCUMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.factory_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE NOT NULL,

    -- Document type
    document_type VARCHAR(50) NOT NULL,
    -- Types: 'commercial_register', 'industrial_license', 'saso_certificate',
    -- 'vat_certificate', 'municipal_license', 'chamber_membership', 'other'

    -- Document details
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(255),

    -- File information
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(50),

    -- Verification status
    status VARCHAR(20) DEFAULT 'pending',
    -- Status: 'pending', 'verified', 'rejected', 'expired'

    verification_notes TEXT,
    verified_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Each factory can only have one document of each type
    UNIQUE(factory_id, document_type)
);

-- Add constraint for document_type
ALTER TABLE public.factory_documents DROP CONSTRAINT IF EXISTS factory_documents_type_check;
ALTER TABLE public.factory_documents ADD CONSTRAINT factory_documents_type_check
  CHECK (document_type IN ('commercial_register', 'industrial_license', 'saso_certificate',
         'vat_certificate', 'municipal_license', 'chamber_membership', 'other'));

-- Add constraint for status
ALTER TABLE public.factory_documents DROP CONSTRAINT IF EXISTS factory_documents_status_check;
ALTER TABLE public.factory_documents ADD CONSTRAINT factory_documents_status_check
  CHECK (status IN ('pending', 'verified', 'rejected', 'expired'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_factory_documents_factory ON public.factory_documents(factory_id);
CREATE INDEX IF NOT EXISTS idx_factory_documents_type ON public.factory_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_factory_documents_status ON public.factory_documents(status);

-- =============================================
-- 3. FACTORY CAPABILITIES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.factory_capabilities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE NOT NULL,

    -- Category of manufacturing capability
    category VARCHAR(50) NOT NULL,
    -- Categories: 'metals', 'plastics', 'chemicals', 'food', 'textiles',
    -- 'electronics', 'construction', 'packaging', 'other'

    subcategory VARCHAR(100),
    description TEXT,

    -- Equipment details
    has_equipment BOOLEAN DEFAULT true,
    equipment_count INTEGER,

    -- Production capacity
    monthly_capacity VARCHAR(100),
    capacity_unit VARCHAR(50),

    -- Certifications for this capability
    certifications TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint for category
ALTER TABLE public.factory_capabilities DROP CONSTRAINT IF EXISTS factory_capabilities_category_check;
ALTER TABLE public.factory_capabilities ADD CONSTRAINT factory_capabilities_category_check
  CHECK (category IN ('metals', 'plastics', 'chemicals', 'food', 'textiles',
         'electronics', 'construction', 'packaging', 'other'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_factory_capabilities_factory ON public.factory_capabilities(factory_id);
CREATE INDEX IF NOT EXISTS idx_factory_capabilities_category ON public.factory_capabilities(category);

-- =============================================
-- 4. TRIGGERS FOR UPDATED_AT
-- =============================================

-- Trigger for factory_documents
CREATE OR REPLACE TRIGGER update_factory_documents_updated_at
  BEFORE UPDATE ON public.factory_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE public.factory_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factory_capabilities ENABLE ROW LEVEL SECURITY;

-- Factory Documents: Users can only access their own factory's documents
CREATE POLICY "Users can view their factory documents" ON public.factory_documents
    FOR SELECT USING (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their factory documents" ON public.factory_documents
    FOR INSERT WITH CHECK (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their factory documents" ON public.factory_documents
    FOR UPDATE USING (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their factory documents" ON public.factory_documents
    FOR DELETE USING (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

-- Factory Capabilities: Users can only access their own factory's capabilities
CREATE POLICY "Users can view their factory capabilities" ON public.factory_capabilities
    FOR SELECT USING (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their factory capabilities" ON public.factory_capabilities
    FOR INSERT WITH CHECK (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their factory capabilities" ON public.factory_capabilities
    FOR UPDATE USING (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their factory capabilities" ON public.factory_capabilities
    FOR DELETE USING (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

-- =============================================
-- 6. STORAGE BUCKET (Run in Supabase Dashboard)
-- =============================================
-- Note: Create storage bucket 'factory-documents' in Supabase Dashboard
-- with the following policy for authenticated users:
--
-- INSERT policy: (bucket_id = 'factory-documents' AND auth.uid()::text = (storage.foldername(name))[1])
-- SELECT policy: (bucket_id = 'factory-documents' AND auth.uid()::text = (storage.foldername(name))[1])
-- UPDATE policy: (bucket_id = 'factory-documents' AND auth.uid()::text = (storage.foldername(name))[1])
-- DELETE policy: (bucket_id = 'factory-documents' AND auth.uid()::text = (storage.foldername(name))[1])
