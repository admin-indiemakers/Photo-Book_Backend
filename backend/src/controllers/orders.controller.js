import { supabase } from '../config/supabaseClient.js';

// GET /api/orders?status=&search=&from=&to=&page=&limit=
export async function listOrders(req, res, next) {
  try {
    const { status, search, from: fromDate, to: toDate, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase
      .from('orders')
      .select('*, customers(id, full_name, email, phone)', { count: 'exact' })
      .order('placed_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (fromDate) query = query.gte('placed_at', fromDate);
    if (toDate) query = query.lte('placed_at', toDate);
    if (search) query = query.ilike('order_number', `%${search}%`);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    res.json({ orders: data, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id
export async function getOrder(req, res, next) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, customers(*)')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Order not found.' });

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', req.params.id);
    if (itemsError) throw itemsError;

    const { data: history, error: historyError } = await supabase
      .from('order_status_history')
      .select('*, admins(full_name)')
      .eq('order_id', req.params.id)
      .order('created_at', { ascending: true });
    if (historyError) throw historyError;

    res.json({ order, items, history });
  } catch (err) {
    next(err);
  }
}

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

// PATCH /api/orders/:id/status
export async function updateOrderStatus(req, res, next) {
  try {
    const { status, note, tracking_number, courier_name } = req.body;

    const { data: current, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', req.params.id)
      .single();
    if (fetchError) return res.status(404).json({ error: 'Order not found.' });

    if (status && status !== current.status) {
      const allowed = VALID_TRANSITIONS[current.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          error: `Cannot move an order from "${current.status}" to "${status}".`,
        });
      }
    }

    const updates = {};
    if (status) updates.status = status;
    if (tracking_number !== undefined) updates.tracking_number = tracking_number;
    if (courier_name !== undefined) updates.courier_name = courier_name;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    // Attach the admin + note to the auto-created history row from the DB trigger.
    if (status && note) {
      await supabase
        .from('order_status_history')
        .update({ note, changed_by: req.admin.id })
        .eq('order_id', req.params.id)
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    res.json({ order: data });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/orders/:id/notes
export async function updateOrderNotes(req, res, next) {
  try {
    const { admin_notes } = req.body;
    const { data, error } = await supabase
      .from('orders')
      .update({ admin_notes })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ order: data });
  } catch (err) {
    next(err);
  }
}
