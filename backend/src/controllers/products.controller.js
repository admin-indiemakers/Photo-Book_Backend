import { supabase } from '../config/supabaseClient.js';

const BUCKET = process.env.PRODUCT_IMAGES_BUCKET || 'product-images';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/products?category=&search=&is_active=&page=&limit=
export async function listProducts(req, res, next) {
  try {
    const { category, search, is_active, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');
    if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    res.json({ products: data, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
export async function getProduct(req, res, next) {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Product not found.' });
    res.json({ product: data });
  } catch (err) {
    next(err);
  }
}

// POST /api/products
export async function createProduct(req, res, next) {
  try {
    const {
      name,
      category,
      description,
      base_price,
      compare_at_price,
      stock_quantity,
      is_active,
      is_customizable,
      images,
      attributes,
      sku,
    } = req.body;

    if (!name || !category || base_price === undefined) {
      return res.status(400).json({ error: 'name, category and base_price are required.' });
    }

    const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 7);

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        category,
        description,
        base_price,
        compare_at_price: compare_at_price || null,
        stock_quantity: stock_quantity ?? 0,
        is_active: is_active ?? true,
        is_customizable: is_customizable ?? true,
        images: images || [],
        attributes: attributes || {},
        sku: sku || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ product: data });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/products/:id
export async function updateProduct(req, res, next) {
  try {
    const allowedFields = [
      'name',
      'category',
      'description',
      'base_price',
      'compare_at_price',
      'stock_quantity',
      'is_active',
      'is_customizable',
      'images',
      'attributes',
      'sku',
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ product: data });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res, next) {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/products/upload-image  (multipart/form-data, field name: "image")
export async function uploadProductImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided.' });

    const ext = req.file.originalname.split('.').pop();
    const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    res.json({ url: data.publicUrl });
  } catch (err) {
    next(err);
  }
}
