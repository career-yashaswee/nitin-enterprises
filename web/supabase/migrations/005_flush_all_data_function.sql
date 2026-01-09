-- Create a function to flush all data
-- This can be called from the Supabase dashboard or via RPC
-- Usage: SELECT flush_all_data();

CREATE OR REPLACE FUNCTION flush_all_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF get_user_role(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Only admins can flush all data';
  END IF;

  -- Disable triggers temporarily to speed up deletion
  SET session_replication_role = 'replica';

  -- Delete in order: child tables first, then parent tables

  -- 1. Delete payment records (they reference goods receipts)
  DELETE FROM payment_in;
  DELETE FROM payment_out;

  -- 2. Delete goods out items (they reference goods out receipts)
  DELETE FROM goods_out_items;

  -- 3. Delete goods in items (they reference goods in receipts)
  DELETE FROM goods_in_items;

  -- 4. Delete goods receipts (they reference accounts)
  DELETE FROM goods_out_receipts;
  DELETE FROM goods_in_receipts;

  -- 5. Delete inventory (updated by triggers, but can be cleared)
  DELETE FROM inventory;

  -- 6. Delete accounts (parent table)
  DELETE FROM accounts;

  -- 7. Delete user roles (but keep auth.users - those are managed by Supabase Auth)
  DELETE FROM user_roles;

  -- Re-enable triggers
  SET session_replication_role = 'origin';

  RAISE NOTICE 'All data has been flushed successfully';
END;
$$;

-- Grant execute permission to authenticated users (admin check is inside function)
GRANT EXECUTE ON FUNCTION flush_all_data() TO authenticated;
