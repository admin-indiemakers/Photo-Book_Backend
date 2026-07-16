import { useEffect, useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import api from '../lib/api.js';

const CATEGORIES = [
  { value: 'polaroid', label: 'Polaroid' },
  { value: 'photo_frame', label: 'Photo Frame' },
  { value: 'photo_canvas', label: 'Photo Canvas' },
  { value: 'fridge_magnet', label: 'Fridge Magnet' },
  { value: 'acrylic_frame', label: 'Acrylic Frame' },
  { value: 'photo_book', label: 'Photo Book' },
];

const emptyForm = {
  name: '',
  category: 'polaroid',
  description: '',
  base_price: '',
  compare_at_price: '',
  stock_quantity: '',
  sku: '',
  is_active: true,
  is_customizable: true,
  images: [],
};

export default function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category,
        description: product.description || '',
        base_price: product.base_price,
        compare_at_price: product.compare_at_price || '',
        stock_quantity: product.stock_quantity,
        sku: product.sku || '',
        is_active: product.is_active,
        is_customizable: product.is_customizable,
        images: product.images || [],
      });
    } else {
      setForm(emptyForm);
    }
  }, [product]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/products/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      update('images', [...form.images, res.data.url]);
    } catch (err) {
      setError(err.response?.data?.error || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    update(
      'images',
      form.images.filter((i) => i !== url)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        base_price: Number(form.base_price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        stock_quantity: Number(form.stock_quantity) || 0,
      };
      if (product) {
        await api.patch(`/products/${product.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-bold">{product ? 'Edit product' : 'Add new product'}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">{error}</div>
          )}

          <div>
            <label className="label-text">Product name</label>
            <input required className="input-field" value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => update('category', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">SKU</label>
              <input className="input-field" value={form.sku} onChange={(e) => update('sku', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label-text">Description</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label-text">Price (₹)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={form.base_price}
                onChange={(e) => update('base_price', e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">Compare-at price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={form.compare_at_price}
                onChange={(e) => update('compare_at_price', e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">Stock qty</label>
              <input
                required
                type="number"
                min="0"
                className="input-field"
                value={form.stock_quantity}
                onChange={(e) => update('stock_quantity', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Product images</label>
            <div className="flex flex-wrap gap-3">
              {form.images.map((url) => (
                <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-cream">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute inset-0 flex items-center justify-center bg-ink/50 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted hover:border-brand-300 hover:text-brand-500">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                <span className="text-[10px] font-medium">{uploading ? 'Uploading' : 'Add photo'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4 rounded accent-brand-500" />
              Active on storefront
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={form.is_customizable}
                onChange={(e) => update('is_customizable', e.target.checked)}
                className="h-4 w-4 rounded accent-brand-500"
              />
              Customer uploads photo
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
