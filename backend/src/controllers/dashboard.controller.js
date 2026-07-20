import { supabase } from '../config/supabaseClient.js';

// GET /api/dashboard/summary
export async function getSummary(req, res, next) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [ordersToday, orders30d, allOrders, pendingOrders, totalCustomers, totalProducts, lowStock] = await Promise.all([
      supabase.from('orders').select('id, total', { count: 'exact' }).gte('placed_at', startOfToday),
      supabase.from('orders').select('id, total, status, placed_at').gte('placed_at', thirtyDaysAgo),
      supabase.from('orders').select('id, total, status', { count: 'exact' }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id, name, stock_quantity').lt('stock_quantity', 10).eq('is_active', true),
    ]);

    for (const r of [ordersToday, orders30d, allOrders, pendingOrders, totalCustomers, totalProducts, lowStock]) {
      if (r.error) throw r.error;
    }

    const revenueToday = (ordersToday.data || []).reduce((sum, o) => sum + Number(o.total), 0);
    const revenue30d = (orders30d.data || [])
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total), 0);
      
    const totalRevenue = (allOrders.data || [])
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = allOrders.count || 0;

    // Build a day-by-day series for the last 14 days for the revenue chart.
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push(d.toISOString().slice(0, 10));
    }
    const revenueByDay = days.map((day) => {
      const total = (orders30d.data || [])
        .filter((o) => o.status !== 'cancelled' && o.placed_at.slice(0, 10) === day)
        .reduce((sum, o) => sum + Number(o.total), 0);
      return { date: day, revenue: total };
    });

    // Order status breakdown (last 30 days)
    const statusBreakdown = (orders30d.data || []).reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      orders_today: ordersToday.count || 0,
      revenue_today: revenueToday,
      revenue_30d: revenue30d,
      pending_orders: pendingOrders.count || 0,
      total_customers: totalCustomers.count || 0,
      total_products: totalProducts.count || 0,
      low_stock_products: lowStock.data || [],
      revenue_by_day: revenueByDay,
      status_breakdown: statusBreakdown,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/top-products
export async function getTopProducts(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('product_name, category, quantity, line_total');
    if (error) throw error;

    const grouped = data.reduce((acc, item) => {
      const key = item.product_name;
      if (!acc[key]) acc[key] = { product_name: key, category: item.category, units_sold: 0, revenue: 0 };
      acc[key].units_sold += item.quantity;
      acc[key].revenue += Number(item.line_total);
      return acc;
    }, {});

    const top = Object.values(grouped)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    res.json({ top_products: top });
  } catch (err) {
    next(err);
  }
}
