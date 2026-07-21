import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient.js';

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Create a temporary client just for this login to avoid polluting the global service-role client
    const tempClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data, error } = await tempClient.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    // Now use the global service-role client (which hasn't been mutated and bypasses RLS) to fetch the admin data
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, full_name, email, phone, avatar_url, role')
      .eq('id', data.user.id)
      .single();

    if (adminError || !admin) {
      await tempClient.auth.signOut();
      return res.status(403).json({ error: 'This account does not have admin access.' });
    }

    res.json({
      admin,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/refresh
export async function refresh(req, res, next) {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: 'Missing refresh token.' });
    }
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) return res.status(401).json({ error: 'Session expired. Please log in again.' });

    res.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function me(req, res) {
  res.json({ admin: req.admin });
}

// PATCH /api/auth/profile
export async function updateProfile(req, res, next) {
  try {
    const { full_name, phone, avatar_url } = req.body;

    const { data, error } = await supabase
      .from('admins')
      .update({ full_name, phone, avatar_url })
      .eq('id', req.admin.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ admin: data });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/change-password
export async function changePassword(req, res, next) {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const { error } = await supabase.auth.admin.updateUserById(req.admin.id, {
      password: new_password,
    });
    if (error) throw error;

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}
