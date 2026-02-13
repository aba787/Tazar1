-- Bank Transfers table for manual payment processing
CREATE TABLE IF NOT EXISTS bank_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  sender_name TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  transfer_date DATE NOT NULL,
  receipt_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent multiple pending requests per user
CREATE UNIQUE INDEX bank_transfers_one_pending_per_user 
  ON bank_transfers(user_id) 
  WHERE status = 'pending';

-- Performance indexes
CREATE INDEX idx_bank_transfers_status ON bank_transfers(status);
CREATE INDEX idx_bank_transfers_user_id ON bank_transfers(user_id);
CREATE INDEX idx_bank_transfers_created_at ON bank_transfers(created_at DESC);

-- RLS
ALTER TABLE bank_transfers ENABLE ROW LEVEL SECURITY;

-- Users can view their own transfers
CREATE POLICY "Users can view own transfers"
  ON bank_transfers FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transfers
CREATE POLICY "Users can insert own transfers"
  ON bank_transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all transfers
CREATE POLICY "Admins can view all transfers"
  ON bank_transfers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role IN ('admin', 'super_admin') 
        AND user_roles.is_active = true
    )
  );

-- Admin can update transfers (approve/reject)
CREATE POLICY "Admins can update transfers"
  ON bank_transfers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role IN ('admin', 'super_admin') 
        AND user_roles.is_active = true
    )
  );

-- Storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('bank-receipts', 'bank-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can upload to their own folder
CREATE POLICY "Users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bank-receipts'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own receipts
CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'bank-receipts'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can view all receipts
CREATE POLICY "Admins can view all receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'bank-receipts'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'super_admin')
        AND user_roles.is_active = true
    )
  );
