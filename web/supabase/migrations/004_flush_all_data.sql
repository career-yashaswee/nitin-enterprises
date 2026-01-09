-- Flush all data from all tables
-- This script deletes all records from all tables in the correct order
-- to respect foreign key constraints.
-- WARNING: This will delete ALL data. Use with caution!

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

-- Optional: Reset sequences if you have any (UUIDs don't need this, but good practice)
-- This is not needed for UUID primary keys, but included for completeness
