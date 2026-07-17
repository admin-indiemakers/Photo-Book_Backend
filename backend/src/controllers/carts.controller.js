import { supabase } from '../config/supabaseClient.js';

// GET /api/carts
export async function listCarts(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data: carts, error: cartsError, count } = await supabase
      .from('carts')
      .select('*, customers(full_name, email), cart_items(id, product_id, quantity, price, products(name))', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (cartsError) throw cartsError;

    res.json({ carts, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}
