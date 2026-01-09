-- Create a view to get users with their roles and emails
CREATE OR REPLACE VIEW users_with_roles AS
SELECT 
  u.id,
  u.email,
  COALESCE(ur.role, u.raw_user_meta_data->>'role', 'manager')::TEXT as role,
  COALESCE(ur.created_at, u.created_at) as created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id;

-- Grant access to the view
GRANT SELECT ON users_with_roles TO authenticated;

-- Create a function to get all users (for admin only)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Check if user is admin
  IF get_user_role(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Only admins can view all users';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(ur.role, u.raw_user_meta_data->>'role', 'manager')::TEXT as role,
    COALESCE(ur.created_at, u.created_at) as created_at
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  ORDER BY COALESCE(ur.created_at, u.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
