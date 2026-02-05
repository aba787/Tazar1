-- =============================================
-- STRICT RLS POLICIES & TRANSACTIONS
-- Migration: 006_strict_rls_and_transactions.sql
-- Production-ready security policies
-- =============================================

-- =============================================
-- 1. HELPER FUNCTIONS FOR RLS
-- =============================================

-- Get the current user's factory ID
CREATE OR REPLACE FUNCTION public.get_user_factory_id()
RETURNS UUID AS $$
  SELECT id FROM public.factories WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user owns a specific factory
CREATE OR REPLACE FUNCTION public.user_owns_factory(factory_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.factories 
    WHERE id = factory_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- 2. TRANSACTIONS TABLE (Payment Ready)
-- =============================================

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Reference to the payment source
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('deal_participation', 'equipment_booking', 'escrow', 'refund')),
    source_id UUID NOT NULL,
    
    -- Factory involved
    factory_id UUID REFERENCES public.factories(id) ON DELETE SET NULL,
    
    -- Amount in halala (cents)
    amount INTEGER NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Transaction status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled')),
    
    -- Payment details
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    payment_gateway VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    
    -- Error handling
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Verification (never trust frontend)
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_factory ON public.transactions(factory_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON public.transactions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 3. DROP EXISTING PROBLEMATIC POLICIES
-- =============================================

-- Drop old procurement_deals policies (they have bugs)
DROP POLICY IF EXISTS "Deals are viewable by everyone" ON public.procurement_deals;
DROP POLICY IF EXISTS "Deals can be created by authenticated users" ON public.procurement_deals;
DROP POLICY IF EXISTS "Deals can be updated by creator" ON public.procurement_deals;

-- Drop old deal_participations policies
DROP POLICY IF EXISTS "Participations viewable by deal participants" ON public.deal_participations;
DROP POLICY IF EXISTS "Factories can manage their own participations" ON public.deal_participations;

-- Drop old pricing_tiers policies
DROP POLICY IF EXISTS "Pricing tiers are viewable with deals" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Pricing tiers can be managed by deal creator" ON public.pricing_tiers;

-- Drop old supplier_bids policies
DROP POLICY IF EXISTS "Submitted bids are viewable" ON public.supplier_bids;
DROP POLICY IF EXISTS "Suppliers can manage their bids" ON public.supplier_bids;

-- Drop old bid_evaluations policies  
DROP POLICY IF EXISTS "Evaluations viewable by evaluators and deal participants" ON public.bid_evaluations;
DROP POLICY IF EXISTS "Evaluations can be created by participants" ON public.bid_evaluations;

-- =============================================
-- 4. NEW STRICT POLICIES FOR FACTORIES
-- =============================================

-- Drop old policies first
DROP POLICY IF EXISTS "Users can view all verified factories" ON public.factories;
DROP POLICY IF EXISTS "Users can insert their own factory" ON public.factories;
DROP POLICY IF EXISTS "Users can update their own factory" ON public.factories;

-- New strict policies
CREATE POLICY "factories_select" ON public.factories
    FOR SELECT USING (
        user_id = auth.uid() -- Own factory
        OR status = 'verified' -- All verified factories are public
        OR public.is_admin_user() -- Admins see all
    );

CREATE POLICY "factories_insert" ON public.factories
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

CREATE POLICY "factories_update" ON public.factories
    FOR UPDATE USING (
        user_id = auth.uid()
        OR public.is_admin_user()
    );

CREATE POLICY "factories_delete" ON public.factories
    FOR DELETE USING (
        public.is_admin_user() -- Only admins can delete
    );

-- =============================================
-- 5. STRICT POLICIES FOR PROCUREMENT_DEALS
-- =============================================

CREATE POLICY "deals_select" ON public.procurement_deals
    FOR SELECT USING (
        status NOT IN ('draft') -- Public deals visible
        OR public.user_owns_factory(creator_factory_id) -- Creator sees drafts
        OR public.is_admin_user() -- Admins see all
    );

CREATE POLICY "deals_insert" ON public.procurement_deals
    FOR INSERT WITH CHECK (
        public.user_owns_factory(creator_factory_id)
    );

CREATE POLICY "deals_update" ON public.procurement_deals
    FOR UPDATE USING (
        public.user_owns_factory(creator_factory_id)
        OR public.is_admin_user()
    );

CREATE POLICY "deals_delete" ON public.procurement_deals
    FOR DELETE USING (
        (public.user_owns_factory(creator_factory_id) AND status = 'draft')
        OR public.is_admin_user()
    );

-- =============================================
-- 6. STRICT POLICIES FOR DEAL_PARTICIPATIONS
-- =============================================

CREATE POLICY "participations_select" ON public.deal_participations
    FOR SELECT USING (
        public.user_owns_factory(factory_id) -- Own participations
        OR EXISTS ( -- Deal creator can see all participations
            SELECT 1 FROM public.procurement_deals pd 
            WHERE pd.id = deal_participations.deal_id 
            AND public.user_owns_factory(pd.creator_factory_id)
        )
        OR public.is_admin_user()
    );

CREATE POLICY "participations_insert" ON public.deal_participations
    FOR INSERT WITH CHECK (
        public.user_owns_factory(factory_id)
    );

CREATE POLICY "participations_update" ON public.deal_participations
    FOR UPDATE USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

CREATE POLICY "participations_delete" ON public.deal_participations
    FOR DELETE USING (
        (public.user_owns_factory(factory_id) AND status = 'interested')
        OR public.is_admin_user()
    );

-- =============================================
-- 7. STRICT POLICIES FOR PRICING_TIERS
-- =============================================

CREATE POLICY "pricing_tiers_select" ON public.pricing_tiers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.procurement_deals pd
            WHERE pd.id = pricing_tiers.deal_id
            AND (pd.status NOT IN ('draft') OR public.user_owns_factory(pd.creator_factory_id))
        )
        OR public.is_admin_user()
    );

CREATE POLICY "pricing_tiers_insert" ON public.pricing_tiers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.procurement_deals pd
            WHERE pd.id = pricing_tiers.deal_id
            AND public.user_owns_factory(pd.creator_factory_id)
        )
    );

CREATE POLICY "pricing_tiers_update" ON public.pricing_tiers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.procurement_deals pd
            WHERE pd.id = pricing_tiers.deal_id
            AND public.user_owns_factory(pd.creator_factory_id)
        )
        OR public.is_admin_user()
    );

CREATE POLICY "pricing_tiers_delete" ON public.pricing_tiers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.procurement_deals pd
            WHERE pd.id = pricing_tiers.deal_id
            AND public.user_owns_factory(pd.creator_factory_id)
        )
        OR public.is_admin_user()
    );

-- =============================================
-- 8. STRICT POLICIES FOR EQUIPMENT
-- =============================================

DROP POLICY IF EXISTS "View available equipment" ON public.equipment;
DROP POLICY IF EXISTS "Owners can insert equipment" ON public.equipment;
DROP POLICY IF EXISTS "Owners can update equipment" ON public.equipment;

CREATE POLICY "equipment_select" ON public.equipment
    FOR SELECT USING (
        status != 'unavailable'
        OR public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

CREATE POLICY "equipment_insert" ON public.equipment
    FOR INSERT WITH CHECK (
        public.user_owns_factory(factory_id)
    );

CREATE POLICY "equipment_update" ON public.equipment
    FOR UPDATE USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

CREATE POLICY "equipment_delete" ON public.equipment
    FOR DELETE USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

-- =============================================
-- 9. STRICT POLICIES FOR EQUIPMENT_BOOKINGS
-- =============================================

DROP POLICY IF EXISTS "View own bookings" ON public.equipment_bookings;

CREATE POLICY "bookings_select" ON public.equipment_bookings
    FOR SELECT USING (
        public.user_owns_factory(renter_factory_id)
        OR EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_bookings.equipment_id
            AND public.user_owns_factory(e.factory_id)
        )
        OR public.is_admin_user()
    );

CREATE POLICY "bookings_insert" ON public.equipment_bookings
    FOR INSERT WITH CHECK (
        public.user_owns_factory(renter_factory_id)
    );

CREATE POLICY "bookings_update" ON public.equipment_bookings
    FOR UPDATE USING (
        public.user_owns_factory(renter_factory_id)
        OR EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_bookings.equipment_id
            AND public.user_owns_factory(e.factory_id)
        )
        OR public.is_admin_user()
    );

-- =============================================
-- 10. STRICT POLICIES FOR NOTIFICATIONS
-- =============================================

DROP POLICY IF EXISTS "View own notifications" ON public.notifications;

CREATE POLICY "notifications_select" ON public.notifications
    FOR SELECT USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

CREATE POLICY "notifications_insert" ON public.notifications
    FOR INSERT WITH CHECK (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

CREATE POLICY "notifications_update" ON public.notifications
    FOR UPDATE USING (
        public.user_owns_factory(factory_id)
    );

CREATE POLICY "notifications_delete" ON public.notifications
    FOR DELETE USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

-- =============================================
-- 11. STRICT POLICIES FOR FACTORY_DOCUMENTS
-- =============================================

DROP POLICY IF EXISTS "Users can view their factory documents" ON public.factory_documents;
DROP POLICY IF EXISTS "Users can insert their factory documents" ON public.factory_documents;
DROP POLICY IF EXISTS "Users can update their factory documents" ON public.factory_documents;
DROP POLICY IF EXISTS "Users can delete their factory documents" ON public.factory_documents;

CREATE POLICY "factory_documents_select" ON public.factory_documents
    FOR SELECT USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

CREATE POLICY "factory_documents_insert" ON public.factory_documents
    FOR INSERT WITH CHECK (
        public.user_owns_factory(factory_id)
    );

CREATE POLICY "factory_documents_update" ON public.factory_documents
    FOR UPDATE USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

CREATE POLICY "factory_documents_delete" ON public.factory_documents
    FOR DELETE USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

-- =============================================
-- 12. STRICT POLICIES FOR FACTORY_CAPABILITIES
-- =============================================

DROP POLICY IF EXISTS "Users can view their factory capabilities" ON public.factory_capabilities;
DROP POLICY IF EXISTS "Users can insert their factory capabilities" ON public.factory_capabilities;
DROP POLICY IF EXISTS "Users can update their factory capabilities" ON public.factory_capabilities;
DROP POLICY IF EXISTS "Users can delete their factory capabilities" ON public.factory_capabilities;

CREATE POLICY "factory_capabilities_select" ON public.factory_capabilities
    FOR SELECT USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

CREATE POLICY "factory_capabilities_insert" ON public.factory_capabilities
    FOR INSERT WITH CHECK (
        public.user_owns_factory(factory_id)
    );

CREATE POLICY "factory_capabilities_update" ON public.factory_capabilities
    FOR UPDATE USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

CREATE POLICY "factory_capabilities_delete" ON public.factory_capabilities
    FOR DELETE USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

-- =============================================
-- 13. POLICIES FOR TRANSACTIONS
-- =============================================

CREATE POLICY "transactions_select" ON public.transactions
    FOR SELECT USING (
        public.user_owns_factory(factory_id)
        OR public.is_admin_user()
    );

-- Only system/admin can insert transactions (never from frontend)
CREATE POLICY "transactions_insert" ON public.transactions
    FOR INSERT WITH CHECK (
        public.is_admin_user()
    );

CREATE POLICY "transactions_update" ON public.transactions
    FOR UPDATE USING (
        public.is_admin_user()
    );

-- =============================================
-- 14. POLICIES FOR SUPPLIER_BIDS
-- =============================================

CREATE POLICY "supplier_bids_select" ON public.supplier_bids
    FOR SELECT USING (
        status NOT IN ('draft')
        OR EXISTS (
            SELECT 1 FROM public.suppliers s 
            WHERE s.id = supplier_bids.supplier_id 
        )
        OR public.is_admin_user()
    );

CREATE POLICY "supplier_bids_all" ON public.supplier_bids
    FOR ALL USING (
        public.is_admin_user()
    );

-- =============================================
-- 15. POLICIES FOR BID_EVALUATIONS
-- =============================================

CREATE POLICY "bid_evaluations_select" ON public.bid_evaluations
    FOR SELECT USING (
        public.user_owns_factory(evaluator_factory_id)
        OR EXISTS (
            SELECT 1 FROM public.supplier_bids sb
            JOIN public.procurement_deals pd ON pd.id = sb.deal_id
            WHERE sb.id = bid_evaluations.bid_id
            AND public.user_owns_factory(pd.creator_factory_id)
        )
        OR public.is_admin_user()
    );

CREATE POLICY "bid_evaluations_insert" ON public.bid_evaluations
    FOR INSERT WITH CHECK (
        public.user_owns_factory(evaluator_factory_id)
    );

CREATE POLICY "bid_evaluations_update" ON public.bid_evaluations
    FOR UPDATE USING (
        public.user_owns_factory(evaluator_factory_id)
        OR public.is_admin_user()
    );

-- =============================================
-- 16. POLICIES FOR REVIEWS
-- =============================================

DROP POLICY IF EXISTS "reviews_policy" ON public.reviews;

CREATE POLICY "reviews_select" ON public.reviews
    FOR SELECT USING (true); -- Reviews are public

CREATE POLICY "reviews_insert" ON public.reviews
    FOR INSERT WITH CHECK (
        public.user_owns_factory(reviewer_factory_id)
    );

CREATE POLICY "reviews_update" ON public.reviews
    FOR UPDATE USING (
        public.user_owns_factory(reviewer_factory_id)
    );

CREATE POLICY "reviews_delete" ON public.reviews
    FOR DELETE USING (
        public.user_owns_factory(reviewer_factory_id)
        OR public.is_admin_user()
    );

-- =============================================
-- 17. POLICIES FOR ADMIN_LOGS
-- =============================================

-- Make admin_logs more restrictive
DROP POLICY IF EXISTS "Admin logs viewable by authenticated users" ON public.admin_logs;
DROP POLICY IF EXISTS "Admin logs insertable by authenticated users" ON public.admin_logs;

CREATE POLICY "admin_logs_select" ON public.admin_logs
    FOR SELECT USING (
        public.is_admin_user()
    );

CREATE POLICY "admin_logs_insert" ON public.admin_logs
    FOR INSERT WITH CHECK (
        public.is_admin_user()
    );

-- =============================================
-- 18. POLICIES FOR ADMIN_SETTINGS
-- =============================================

DROP POLICY IF EXISTS "Admin settings viewable by authenticated users" ON public.admin_settings;
DROP POLICY IF EXISTS "Admin settings modifiable by authenticated users" ON public.admin_settings;

CREATE POLICY "admin_settings_select" ON public.admin_settings
    FOR SELECT USING (
        public.is_admin_user()
    );

CREATE POLICY "admin_settings_all" ON public.admin_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'super_admin'
            AND is_active = true
        )
    );

-- =============================================
-- 19. ADDITIONAL INDEXES FOR PERFORMANCE
-- =============================================

-- User roles lookup optimization
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup 
    ON public.user_roles(user_id, role, is_active) 
    WHERE is_active = true;

-- Factories user lookup
CREATE INDEX IF NOT EXISTS idx_factories_user_lookup 
    ON public.factories(user_id);

-- Deals status and creator lookup
CREATE INDEX IF NOT EXISTS idx_deals_creator_status 
    ON public.procurement_deals(creator_factory_id, status);

-- Participations composite index
CREATE INDEX IF NOT EXISTS idx_participations_factory_deal 
    ON public.deal_participations(factory_id, deal_id);
