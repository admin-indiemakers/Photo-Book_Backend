import { useEffect, useState } from 'react';
import { X, Upload, Loader2, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api.js';
import { SliderMatrix } from './ui/SliderMatrix.jsx';

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
  base_price: '1499',
  compare_at_price: '',
  stock_quantity: '100',
  sku: '',
  is_active: true,
  is_customizable: true,
  images: [],
  attributes: {
    shape: 'square',
    size: '8x8 inch'
  }
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
        attributes: product.attributes || { shape: 'square', size: '8x8 inch' }
      });
    } else {
      setForm(emptyForm);
    }
  }, [product]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateAttribute(key, value) {
    setForm((f) => ({
      ...f,
      attributes: {
        ...f.attributes,
        [key]: value
      }
    }));
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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ y: 50, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-sm bg-white shadow-2xl border border-border"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/90 backdrop-blur-md px-8 py-6">
            <div>
              <h2 className="font-editorial text-2xl text-ink leading-none">{product ? 'Edit Publication' : 'New Publication'}</h2>
              <p className="font-functional text-[10px] uppercase tracking-widest text-muted mt-2">Configure asset parameters</p>
            </div>
            <button onClick={onClose} className="text-muted hover:text-ink transition-colors p-2 rounded-full hover:bg-cream">
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-12">
            {error && (
              <div className="rounded-sm border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger font-functional">
                {error}
              </div>
            )}

            {/* Core Details section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="label-text">Publication Title</label>
                  <input required className="input-field text-lg" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. The Wedding Archive" />
                </div>
                <div>
                  <label className="label-text">Product Line</label>
                  <select className="input-field" value={form.category} onChange={(e) => update('category', e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Format (Shape)</label>
                    <select className="input-field" value={form.attributes?.shape || 'square'} onChange={(e) => updateAttribute('shape', e.target.value)}>
                      <option value="square">Square</option>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Dimensions</label>
                    <input className="input-field" value={form.attributes?.size || ''} onChange={(e) => updateAttribute('size', e.target.value)} placeholder="e.g. 8x8 inch" />
                  </div>
                </div>
                <div>
                  <label className="label-text">SKU Identifier</label>
                  <input className="input-field font-mono text-xs" value={form.sku} onChange={(e) => update('sku', e.target.value)} placeholder="PB-WED-01" />
                </div>
              </div>

              {/* Asset Preview / Image Upload */}
              <div>
                <label className="label-text">Asset Photography</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-border bg-cream hover:border-brand-500 hover:text-brand-500 hover:bg-white transition-colors">
                    {uploading ? <Loader2 size={24} className="animate-spin text-ink" /> : <ImagePlus size={24} className="text-muted" />}
                    <span className="font-functional text-xs uppercase tracking-wider text-muted">Upload Media</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  {form.images.map((url) => (
                    <div key={url} className="group relative h-40 overflow-hidden rounded-sm border border-border bg-cream">
                      <img src={url} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute inset-0 flex items-center justify-center bg-ink/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="label-text">Editorial Description</label>
              <textarea
                className="input-field min-h-[120px] resize-y leading-relaxed"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Describe the physical qualities of this product..."
              />
            </div>

            {/* Dynamic Pricing Matrix Integration */}
            <div>
              <SliderMatrix 
                initialPrice={Number(form.base_price) || 1499} 
                onChange={(newPrice) => update('base_price', newPrice)}
              />
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-border pt-8">
               <div>
                  <label className="label-text">Inventory Count</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="input-field text-lg"
                    value={form.stock_quantity}
                    onChange={(e) => update('stock_quantity', e.target.value)}
                  />
                </div>
                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4 appearance-none rounded-sm border border-border checked:bg-ink checked:border-ink transition-colors" />
                    <span className="font-functional text-sm text-ink group-hover:text-ink/70">Published to Storefront</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.is_customizable}
                      onChange={(e) => update('is_customizable', e.target.checked)}
                      className="h-4 w-4 appearance-none rounded-sm border border-border checked:bg-ink checked:border-ink transition-colors"
                    />
                    <span className="font-functional text-sm text-ink group-hover:text-ink/70">Accepts Client Artwork</span>
                  </label>
                </div>
            </div>

            <div className="sticky bottom-0 -mx-8 -mb-8 flex justify-end gap-4 border-t border-border bg-white px-8 py-6">
              <button type="button" onClick={onClose} className="btn-secondary">
                Discard
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Processing...' : product ? 'Commit Changes' : 'Publish Asset'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
