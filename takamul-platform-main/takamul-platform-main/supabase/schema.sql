-- =============================================
-- 🏭 منصة التكامل الصناعي - Database Schema
-- Supabase PostgreSQL
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. FACTORIES (المصانع)
-- =============================================
CREATE TABLE public.factories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    commercial_registration VARCHAR(20) UNIQUE NOT NULL,
    city VARCHAR(50) NOT NULL,
    region VARCHAR(100),
    industry_type VARCHAR(50) NOT NULL,
    employee_count INTEGER DEFAULT 0,
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_url TEXT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'suspended')),
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_orders INTEGER DEFAULT 0,
    total_rentals INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_factories_user_id ON public.factories(user_id);
CREATE INDEX idx_factories_city ON public.factories(city);
CREATE INDEX idx_factories_industry ON public.factories(industry_type);
CREATE INDEX idx_factories_status ON public.factories(status);

-- =============================================
-- 2. GROUP BUYING ORDERS (طلبات الشراء الجماعي)
-- =============================================
CREATE TABLE public.group_buying_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    material_type VARCHAR(50) NOT NULL,
    material_specs TEXT,
    target_quantity DECIMAL(15,2) NOT NULL,
    current_quantity DECIMAL(15,2) DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    target_price_per_unit BIGINT NOT NULL, -- stored in halala (cents)
    market_price_per_unit BIGINT NOT NULL, -- stored in halala
    min_participants INTEGER DEFAULT 3,
    current_participants INTEGER DEFAULT 1,
    deadline TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'collecting', 'negotiating', 'ordered', 'shipping', 'delivered', 'cancelled')),
    supplier_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_creator ON public.group_buying_orders(creator_factory_id);
CREATE INDEX idx_orders_status ON public.group_buying_orders(status);
CREATE INDEX idx_orders_material ON public.group_buying_orders(material_type);
CREATE INDEX idx_orders_deadline ON public.group_buying_orders(deadline);

-- =============================================
-- 3. ORDER PARTICIPATIONS (المشاركات في الطلبات)
-- =============================================
CREATE TABLE public.order_participations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.group_buying_orders(id) ON DELETE CASCADE NOT NULL,
    factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
    notes TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    UNIQUE(order_id, factory_id)
);

CREATE INDEX idx_participations_order ON public.order_participations(order_id);
CREATE INDEX idx_participations_factory ON public.order_participations(factory_id);

-- =============================================
-- 4. EQUIPMENT (المعدات)
-- =============================================
CREATE TABLE public.equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    description TEXT,
    specifications JSONB DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    hourly_rate BIGINT NOT NULL, -- in halala
    daily_rate BIGINT NOT NULL,
    weekly_rate BIGINT NOT NULL,
    min_rental_hours INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'unavailable')),
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_rentals INTEGER DEFAULT 0,
    location VARCHAR(50) NOT NULL,
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_factory ON public.equipment(factory_id);
CREATE INDEX idx_equipment_type ON public.equipment(type);
CREATE INDEX idx_equipment_status ON public.equipment(status);
CREATE INDEX idx_equipment_location ON public.equipment(location);

-- =============================================
-- 5. EQUIPMENT BOOKINGS (حجوزات المعدات)
-- =============================================
CREATE TABLE public.equipment_bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
    renter_factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    total_hours DECIMAL(10,2) NOT NULL,
    total_amount BIGINT NOT NULL, -- in halala
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_bookings_equipment ON public.equipment_bookings(equipment_id);
CREATE INDEX idx_bookings_renter ON public.equipment_bookings(renter_factory_id);
CREATE INDEX idx_bookings_dates ON public.equipment_bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON public.equipment_bookings(status);

-- =============================================
-- 6. SUPPLIERS (الموردون)
-- =============================================
CREATE TABLE public.suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('manufacturer', 'distributor', 'importer')),
    materials TEXT[] DEFAULT '{}',
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    website TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_orders INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suppliers_verified ON public.suppliers(verified);

-- =============================================
-- 7. NOTIFICATIONS (الإشعارات)
-- =============================================
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_factory ON public.notifications(factory_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- =============================================
-- 8. REVIEWS (التقييمات)
-- =============================================
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reviewer_factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE NOT NULL,
    target_type VARCHAR(20) CHECK (target_type IN ('factory', 'equipment', 'supplier')),
    target_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_factory_id, target_type, target_id)
);

CREATE INDEX idx_reviews_target ON public.reviews(target_type, target_id);

-- =============================================
-- 9. VERIFICATION DOCUMENTS (وثائق التحقق)
-- =============================================
CREATE TABLE public.verification_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    notes TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_factory ON public.verification_documents(factory_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_factories_updated_at BEFORE UPDATE ON public.factories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.group_buying_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update order stats when participation changes
CREATE OR REPLACE FUNCTION update_order_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.group_buying_orders 
        SET 
            current_quantity = current_quantity + NEW.quantity,
            current_participants = current_participants + 1
        WHERE id = NEW.order_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.group_buying_orders 
        SET 
            current_quantity = current_quantity - OLD.quantity,
            current_participants = current_participants - 1
        WHERE id = OLD.order_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.group_buying_orders 
        SET current_quantity = current_quantity - OLD.quantity + NEW.quantity
        WHERE id = NEW.order_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_order_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.order_participations
FOR EACH ROW EXECUTE FUNCTION update_order_stats();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_buying_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Factories: Users can only manage their own factory
CREATE POLICY "Users can view all verified factories" ON public.factories
    FOR SELECT USING (status = 'verified' OR user_id = auth.uid());

CREATE POLICY "Users can insert their own factory" ON public.factories
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own factory" ON public.factories
    FOR UPDATE USING (user_id = auth.uid());

-- Orders: All verified factories can view, creators can manage
CREATE POLICY "Verified factories can view open orders" ON public.group_buying_orders
    FOR SELECT USING (status != 'draft' OR creator_factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

CREATE POLICY "Factories can create orders" ON public.group_buying_orders
    FOR INSERT WITH CHECK (creator_factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

CREATE POLICY "Creators can update their orders" ON public.group_buying_orders
    FOR UPDATE USING (creator_factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

-- Participations: Participants can manage their own
CREATE POLICY "View own participations" ON public.order_participations
    FOR SELECT USING (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

CREATE POLICY "Create own participation" ON public.order_participations
    FOR INSERT WITH CHECK (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

-- Equipment: All can view available, owners can manage
CREATE POLICY "View available equipment" ON public.equipment
    FOR SELECT USING (status != 'unavailable' OR factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

CREATE POLICY "Owners can insert equipment" ON public.equipment
    FOR INSERT WITH CHECK (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

CREATE POLICY "Owners can update equipment" ON public.equipment
    FOR UPDATE USING (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

-- Bookings: Renters and owners can view/manage
CREATE POLICY "View own bookings" ON public.equipment_bookings
    FOR SELECT USING (
        renter_factory_id IN (SELECT id FROM public.factories WHERE user_id = auth.uid())
        OR equipment_id IN (
            SELECT id FROM public.equipment WHERE factory_id IN (
                SELECT id FROM public.factories WHERE user_id = auth.uid()
            )
        )
    );

-- Notifications: Users see their own
CREATE POLICY "View own notifications" ON public.notifications
    FOR SELECT USING (factory_id IN (
        SELECT id FROM public.factories WHERE user_id = auth.uid()
    ));

-- =============================================
-- SAMPLE DATA (for development)
-- =============================================

-- Note: Insert sample data after creating a test user in Supabase Auth
-- You can uncomment and modify the following after setting up auth

/*
-- Sample Factory (replace USER_ID with actual auth.uid())
INSERT INTO public.factories (user_id, name, commercial_registration, city, region, industry_type, employee_count, contact_name, contact_phone, contact_email, status)
VALUES 
('USER_ID_HERE', 'مصنع النور للألمنيوم', '1010123456', 'riyadh', 'المنطقة الصناعية الثانية', 'metals', 50, 'أحمد محمد', '0501234567', 'ahmed@alnoor.com', 'verified');
*/
