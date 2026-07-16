import { supabase } from '../config/supabaseClient.js';

// GET /api/customers?search=&is_blocked=&page=&limit=
export async function listCustomers(req, res, next) {
  try {
    const { search, is_blocked, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase.from('customers').select('*', { count: 'exact' }).order('created_at', { ascending: false });

    if (is_blocked !== undefined) query = query.eq('is_blocked', is_blocked === 'true');
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    // Attach lifetime order count + spend for each customer (lightweight aggregate).
    const customerIds = data.map((c) => c.id);
    let ordersByCustomer = {};
    if (customerIds.length) {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_id, total, status')
        .in('customer_id', customerIds);
      if (ordersError) throw ordersError;

      ordersByCustomer = orders.reduce((acc, o) => {
        if (!acc[o.customer_id]) acc[o.customer_id] = { order_count: 0, total_spent: 0 };
        acc[o.customer_id].order_count += 1;
        if (o.status !== 'cancelled') acc[o.customer_id].total_spent += Number(o.total);
        return acc;
      }, {});
    }

    const customers = data.map((c) => ({
      ...c,
      order_count: ordersByCustomer[c.id]?.order_count || 0,
      total_spent: ordersByCustomer[c.id]?.total_spent || 0,
    }));

    res.json({ customers, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

// GET /api/customers/:id
export async function getCustomer(req, res, next) {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) return res.status(404).json({ error: 'Customer not found.' });

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, total, placed_at')
      .eq('customer_id', req.params.id)
      .order('placed_at', { ascending: false });
    if (ordersError) throw ordersError;

    res.json({ customer, orders });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/customers/:id
export async function updateCustomer(req, res, next) {
  try {
    const allowedFields = [
      'full_name',
      'phone',
      'address_line1',
      'address_line2',
      'city',
      'state',
      'postal_code',
      'country',
      'notes',
      'is_blocked',
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    res.json({ customer: data });
  } catch (err) {
    next(err);
  }
}
