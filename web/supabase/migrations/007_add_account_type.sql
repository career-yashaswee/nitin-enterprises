-- Add type column to accounts table
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('creditor', 'debitor')) DEFAULT 'debitor';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);

-- Update existing accounts to have a default type (debitor)
UPDATE accounts SET type = 'debitor' WHERE type IS NULL;
