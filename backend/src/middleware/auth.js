import { supabase } from '../config/supabaseClient.js';

/**
 * Verifies the Supabase access token sent from the admin frontend
 * (Authorization: Bearer <token>) and attaches the matching admin
 * profile (from the `admins` table) to req.admin.
 *
 * Rejects the request if the token is invalid/expired, or if the
 * authenticated user does not have a row in `admins` (i.e. is a
 * customer, not staff).
 */
export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing authentication token.' });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, full_name, email, phone, avatar_url, role')
      .eq('id', userData.user.id)
      .single();

    if (adminError || !admin) {
      return res.status(403).json({ error: 'This account does not have admin access.' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Restricts a route to specific admin roles, e.g. requireRole('super_admin').
 * Use after requireAdmin.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action.' });
    }
    next();
  };
}
