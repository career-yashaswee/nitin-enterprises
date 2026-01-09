-- Add INSERT and UPDATE policies for inventory table
-- These are needed for triggers to update inventory when goods_in/out_items are modified

-- Allow users to insert into inventory (for triggers when goods_in_items are created)
CREATE POLICY "Users can insert into inventory"
  ON inventory
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));

-- Allow users to update inventory (for triggers when goods_in/out_items are modified)
CREATE POLICY "Users can update inventory"
  ON inventory
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));
