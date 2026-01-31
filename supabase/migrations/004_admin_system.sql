-- =============================================
-- ADMIN SYSTEM
-- Migration: 004_admin_system.sql
-- =============================================

-- Admin settings table (key-value store for platform settings)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Admin activity log (audit trail)
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50), -- 'factory', 'deal', 'user', 'document', 'setting'
    target_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for admin_logs
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON public.admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON public.admin_logs(target_type, target_id);

-- Enable RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive - filtering done in app layer)
CREATE POLICY "Admin logs viewable by authenticated users" ON public.admin_logs
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin logs insertable by authenticated users" ON public.admin_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admin settings viewable by authenticated users" ON public.admin_settings
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin settings modifiable by authenticated users" ON public.admin_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger for updated_at on admin_settings
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_settings_updated_at();

-- Insert default settings
INSERT INTO public.admin_settings (key, value) VALUES
    ('platform_name', '"تكامل"'),
    ('platform_status', '"active"'),
    ('maintenance_mode', 'false'),
    ('registration_enabled', 'true'),
    ('max_deals_per_factory', '10'),
    ('max_equipment_per_factory', '20')
ON CONFLICT (key) DO NOTHING;
