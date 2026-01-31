-- =============================================
-- USER ROLES SYSTEM
-- Migration: 005_user_roles.sql
-- Replaces hardcoded admin emails with database-driven roles
-- =============================================

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_role CHECK (role IN ('user', 'admin', 'super_admin', 'moderator'))
);

-- Unique constraint: one active role per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_unique_active 
    ON public.user_roles(user_id, role) 
    WHERE is_active = true;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin') 
            AND is_active = true
        )
    );

CREATE POLICY "Super admins can manage roles" ON public.user_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin' 
            AND is_active = true
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_roles_updated_at();

-- Helper function to check if user has role
CREATE OR REPLACE FUNCTION public.user_has_role(check_user_id UUID, check_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = check_user_id
        AND role = check_role
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin (any admin level)
CREATE OR REPLACE FUNCTION public.user_is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = check_user_id
        AND role IN ('admin', 'super_admin')
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
