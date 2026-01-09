-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_info TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goods In Receipts table
CREATE TABLE IF NOT EXISTS goods_in_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  notes TEXT,
  total_amount DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goods In Items table
CREATE TABLE IF NOT EXISTS goods_in_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL REFERENCES goods_in_receipts(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(15, 2) NOT NULL CHECK (unit_price >= 0),
  total DECIMAL(15, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goods Out Receipts table
CREATE TABLE IF NOT EXISTS goods_out_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  notes TEXT,
  total_amount DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goods Out Items table
CREATE TABLE IF NOT EXISTS goods_out_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL REFERENCES goods_out_receipts(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(15, 2) NOT NULL CHECK (unit_price >= 0),
  total DECIMAL(15, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Out table
CREATE TABLE IF NOT EXISTS payment_out (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goods_in_receipt_id UUID NOT NULL REFERENCES goods_in_receipts(id) ON DELETE RESTRICT,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment In table
CREATE TABLE IF NOT EXISTS payment_in (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goods_out_receipt_id UUID NOT NULL REFERENCES goods_out_receipts(id) ON DELETE RESTRICT,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL UNIQUE,
  quantity_in DECIMAL(10, 2) DEFAULT 0 CHECK (quantity_in >= 0),
  quantity_out DECIMAL(10, 2) DEFAULT 0 CHECK (quantity_out >= 0),
  available_quantity DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_in - quantity_out) STORED,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update goods_in_receipts total_amount
CREATE OR REPLACE FUNCTION update_goods_in_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goods_in_receipts
  SET total_amount = (
    SELECT COALESCE(SUM(total), 0)
    FROM goods_in_items
    WHERE receipt_id = COALESCE(NEW.receipt_id, OLD.receipt_id)
  )
  WHERE id = COALESCE(NEW.receipt_id, OLD.receipt_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for goods_in_items
CREATE TRIGGER trigger_update_goods_in_total
  AFTER INSERT OR UPDATE OR DELETE ON goods_in_items
  FOR EACH ROW
  EXECUTE FUNCTION update_goods_in_total();

-- Function to update goods_out_receipts total_amount
CREATE OR REPLACE FUNCTION update_goods_out_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goods_out_receipts
  SET total_amount = (
    SELECT COALESCE(SUM(total), 0)
    FROM goods_out_items
    WHERE receipt_id = COALESCE(NEW.receipt_id, OLD.receipt_id)
  )
  WHERE id = COALESCE(NEW.receipt_id, OLD.receipt_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for goods_out_items
CREATE TRIGGER trigger_update_goods_out_total
  AFTER INSERT OR UPDATE OR DELETE ON goods_out_items
  FOR EACH ROW
  EXECUTE FUNCTION update_goods_out_total();

-- Function to update inventory on goods_in
CREATE OR REPLACE FUNCTION update_inventory_on_goods_in()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO inventory (item_name, quantity_in, updated_at)
    VALUES (NEW.item_name, NEW.quantity, NOW())
    ON CONFLICT (item_name) DO UPDATE
    SET quantity_in = inventory.quantity_in + NEW.quantity,
        updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE inventory
    SET quantity_in = quantity_in - OLD.quantity + NEW.quantity,
        updated_at = NOW()
    WHERE item_name = NEW.item_name;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE inventory
    SET quantity_in = quantity_in - OLD.quantity,
        updated_at = NOW()
    WHERE item_name = OLD.item_name;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for goods_in_items inventory updates
CREATE TRIGGER trigger_update_inventory_on_goods_in
  AFTER INSERT OR UPDATE OR DELETE ON goods_in_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_goods_in();

-- Function to update inventory on goods_out
CREATE OR REPLACE FUNCTION update_inventory_on_goods_out()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE inventory
    SET quantity_out = quantity_out + NEW.quantity,
        updated_at = NOW()
    WHERE item_name = NEW.item_name;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE inventory
    SET quantity_out = quantity_out - OLD.quantity + NEW.quantity,
        updated_at = NOW()
    WHERE item_name = NEW.item_name;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE inventory
    SET quantity_out = quantity_out - OLD.quantity,
        updated_at = NOW()
    WHERE item_name = OLD.item_name;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for goods_out_items inventory updates
CREATE TRIGGER trigger_update_inventory_on_goods_out
  AFTER INSERT OR UPDATE OR DELETE ON goods_out_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_goods_out();

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = user_uuid;
  
  IF user_role IS NULL THEN
    -- Fallback to user metadata
    SELECT raw_user_meta_data->>'role' INTO user_role
    FROM auth.users
    WHERE id = user_uuid;
  END IF;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_in_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_in_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_out_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_out_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_out ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- User roles policies (admin only)
CREATE POLICY "Admin can manage user roles"
  ON user_roles
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- Accounts policies
CREATE POLICY "Users can view accounts"
  ON accounts
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can create accounts"
  ON accounts
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can update accounts"
  ON accounts
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Admin can delete accounts"
  ON accounts
  FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- Goods In Receipts policies
CREATE POLICY "Users can view goods_in_receipts"
  ON goods_in_receipts
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can create goods_in_receipts"
  ON goods_in_receipts
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can update goods_in_receipts"
  ON goods_in_receipts
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Admin can delete goods_in_receipts"
  ON goods_in_receipts
  FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- Goods In Items policies
CREATE POLICY "Users can view goods_in_items"
  ON goods_in_items
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can create goods_in_items"
  ON goods_in_items
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can update goods_in_items"
  ON goods_in_items
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Admin can delete goods_in_items"
  ON goods_in_items
  FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- Goods Out Receipts policies
CREATE POLICY "Users can view goods_out_receipts"
  ON goods_out_receipts
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can create goods_out_receipts"
  ON goods_out_receipts
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can update goods_out_receipts"
  ON goods_out_receipts
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Admin can delete goods_out_receipts"
  ON goods_out_receipts
  FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- Goods Out Items policies
CREATE POLICY "Users can view goods_out_items"
  ON goods_out_items
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can create goods_out_items"
  ON goods_out_items
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can update goods_out_items"
  ON goods_out_items
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Admin can delete goods_out_items"
  ON goods_out_items
  FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- Payment Out policies
CREATE POLICY "Users can view payment_out"
  ON payment_out
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can create payment_out"
  ON payment_out
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can update payment_out"
  ON payment_out
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Admin can delete payment_out"
  ON payment_out
  FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- Payment In policies
CREATE POLICY "Users can view payment_in"
  ON payment_in
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can create payment_in"
  ON payment_in
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Users can update payment_in"
  ON payment_in
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Admin can delete payment_in"
  ON payment_in
  FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');

-- Inventory policies (read-only for all authenticated users)
CREATE POLICY "Users can view inventory"
  ON inventory
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

-- Function to validate goods out inventory
CREATE OR REPLACE FUNCTION validate_goods_out_inventory()
RETURNS TRIGGER AS $$
DECLARE
  available_qty DECIMAL(10, 2);
BEGIN
  SELECT available_quantity INTO available_qty
  FROM inventory
  WHERE item_name = NEW.item_name;
  
  IF available_qty IS NULL OR available_qty < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient inventory for item %: available %, requested %', 
      NEW.item_name, COALESCE(available_qty, 0), NEW.quantity;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate inventory before goods out
CREATE TRIGGER trigger_validate_goods_out_inventory
  BEFORE INSERT OR UPDATE ON goods_out_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_goods_out_inventory();

-- Function to validate payment out (must have goods_in_receipt)
CREATE OR REPLACE FUNCTION validate_payment_out()
RETURNS TRIGGER AS $$
DECLARE
  receipt_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM goods_in_receipts WHERE id = NEW.goods_in_receipt_id
  ) INTO receipt_exists;
  
  IF NOT receipt_exists THEN
    RAISE EXCEPTION 'Goods In Receipt does not exist';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate payment out
CREATE TRIGGER trigger_validate_payment_out
  BEFORE INSERT OR UPDATE ON payment_out
  FOR EACH ROW
  EXECUTE FUNCTION validate_payment_out();

-- Function to validate payment in (must have goods_out_receipt)
CREATE OR REPLACE FUNCTION validate_payment_in()
RETURNS TRIGGER AS $$
DECLARE
  receipt_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM goods_out_receipts WHERE id = NEW.goods_out_receipt_id
  ) INTO receipt_exists;
  
  IF NOT receipt_exists THEN
    RAISE EXCEPTION 'Goods Out Receipt does not exist';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate payment in
CREATE TRIGGER trigger_validate_payment_in
  BEFORE INSERT OR UPDATE ON payment_in
  FOR EACH ROW
  EXECUTE FUNCTION validate_payment_in();
