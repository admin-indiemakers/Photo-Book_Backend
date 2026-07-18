import { useState } from 'react';
import { Plus, LayoutTemplate, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout.jsx';

const mockTemplates = [
  { id: 1, name: 'Wanderlust (Travel)', category: 'Travel', pages: 24, status: 'Active', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=100&h=150&fit=crop' },
  { id: 2, name: 'Wedding Bliss', category: 'Wedding', pages: 40, status: 'Active', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=100&h=150&fit=crop' },
  { id: 3, name: 'Little One', category: 'Family', pages: 20, status: 'Active', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=100&h=150&fit=crop' },
  { id: 4, name: 'Minimalist Portfolio', category: 'Portfolio', pages: 30, status: 'Draft', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=150&fit=crop' }
];

export default function Templates() {
  const [templates] = useState(mockTemplates);

  return (
    <AdminLayout
      title="Layout Templates"
      subtitle="Manage your pre-designed photobook templates"
      action={
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Create Template
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((tpl) => (
          <div key={tpl.id} className="card p-0 overflow-hidden group">
            <div className="h-48 overflow-hidden relative bg-cream">
              <img
                src={tpl.image}
                alt={tpl.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded-sm ${tpl.status === 'Active' ? 'bg-success/90 text-white' : 'bg-warning/90 text-white'
                  }`}>
                  {tpl.status}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-editorial text-lg text-ink line-clamp-1">{tpl.name}</h3>
                <button className="text-muted hover:text-ink transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs font-functional text-muted mt-4">
                <span className="flex items-center gap-1.5 bg-cream px-2 py-1 rounded-md text-ink">
                  <LayoutTemplate size={14} />
                  {tpl.pages} Pages
                </span>
                <span className="uppercase tracking-widest">{tpl.category}</span>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex gap-2">
                <button className="flex-1 py-1.5 text-xs font-bold text-ink bg-cream rounded hover:bg-brand-50 hover:text-brand-600 transition-colors">
                  Edit Layout
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State / Create New Card */}
        <div className="card p-0 flex flex-col items-center justify-center min-h-[300px] border-dashed border-2 border-border/60 hover:border-brand-500 hover:bg-brand-50/30 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-full bg-cream group-hover:bg-brand-100 flex items-center justify-center text-muted group-hover:text-brand-600 mb-4 transition-colors">
            <Plus size={24} />
          </div>
          <p className="font-editorial text-lg text-ink">New Template</p>
          <p className="font-functional text-xs text-muted mt-1">Design a new starting point</p>
        </div>
      </div>
    </AdminLayout>
  );
}
