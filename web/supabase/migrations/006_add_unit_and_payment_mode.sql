-- Add unit column to goods_in_items
ALTER TABLE goods_in_items
ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'Kg';

-- Add unit column to goods_out_items
ALTER TABLE goods_out_items
ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'Kg';

-- Add payment_mode column to payment_out
ALTER TABLE payment_out
ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'Cash' CHECK (payment_mode IN ('Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'));

-- Add payment_mode column to payment_in
ALTER TABLE payment_in
ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'Cash' CHECK (payment_mode IN ('Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'));
