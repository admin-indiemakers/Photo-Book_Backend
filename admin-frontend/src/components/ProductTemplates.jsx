import { useState, useEffect } from 'react';
import { Plus, LayoutTemplate, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '../components/Layout/AdminLayout.jsx';
import api from '../lib/api.js';
import TemplateLayoutEditor from './TemplateLayoutEditor.jsx';

export default function ProductTemplates({ product, onClose, onSaved }) {
  const [viewingLayout, setViewingLayout] = useState(null);
  const templates = product?.attributes?.templates || [];

  useEffect(() => {
    if (!viewingLayout && templates.length > 0) {
      setViewingLayout(templates[0]);
    }
  }, [templates, viewingLayout]);

  const handleAddTemplate = async () => {
    const name = prompt('Template Name:');
    if (!name) return;
    
    const newTemplate = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      category: 'Uncategorized',
      pages: 20,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&q=80'
    };
    
    const newTemplates = [...templates, newTemplate];
    const newAttributes = { ...product.attributes, templates: newTemplates };
    
    await api.patch(`/products/${product.id}`, { attributes: newAttributes });
    onSaved();
  };

  const handleDelete = async (tplId) => {
    if (!window.confirm('Delete this template?')) return;
    const newTemplates = templates.filter(t => t.id !== tplId);
    const newAttributes = { ...product.attributes, templates: newTemplates };
    await api.patch(`/products/${product.id}`, { attributes: newAttributes });
    if (viewingLayout?.id === tplId) setViewingLayout(null);
    onSaved();
  };

  const handleEdit = async (tplId) => {
    const name = prompt('New Template Name:');
    if (!name) return;
    
    const newTemplates = templates.map(t => t.id === tplId ? { ...t, name } : t);
    const newAttributes = { ...product.attributes, templates: newTemplates };
    await api.patch(`/products/${product.id}`, { attributes: newAttributes });
    if (viewingLayout?.id === tplId) setViewingLayout(newTemplates.find(t => t.id === tplId));
    onSaved();
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden border border-border rounded-xl bg-white shadow-soft">
      {/* LEFT SIDEBAR: Templates List */}
      <div className="w-1/3 flex flex-col border-r border-border bg-cream/30">
        <div className="p-4 border-b border-border flex justify-between items-center bg-white">
          <h3 className="font-editorial text-lg text-ink">Templates</h3>
          <button onClick={handleAddTemplate} className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1">
            <Plus size={14} /> New
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {templates.map(tpl => {
            const isActive = viewingLayout?.id === tpl.id;
            return (
              <div 
                key={tpl.id}
                onClick={() => setViewingLayout(tpl)}
                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                  isActive 
                    ? 'bg-white border-brand-500 shadow-sm' 
                    : 'bg-white/50 border-border hover:border-brand-300 hover:bg-white'
                }`}
              >
                <img src={tpl.image} alt={tpl.name} className="w-12 h-12 object-cover rounded-md border border-border/50" />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isActive ? 'text-brand-600' : 'text-ink'}`}>{tpl.name}</p>
                  <p className="text-[10px] text-muted uppercase tracking-wider">{tpl.pages} Pages</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(tpl.id); }} className="p-1.5 text-muted hover:text-ink rounded bg-cream hover:bg-border/50 transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(tpl.id); }} className="p-1.5 text-danger hover:text-white rounded bg-red-50 hover:bg-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {templates.length === 0 && (
            <div className="text-center py-10 text-muted font-functional text-sm">
              No templates yet. Create one to get started!
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT: Layout Editor */}
      <div className="flex-1 bg-cream/10 overflow-y-auto">
        {viewingLayout ? (
          <div className="p-8">
            <TemplateLayoutEditor template={viewingLayout} onBack={() => {}} hideBack={true} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted space-y-4">
            <LayoutTemplate size={48} className="text-border" strokeWidth={1} />
            <div className="text-center">
              <h3 className="font-editorial text-xl text-ink">Select a Template</h3>
              <p className="text-sm font-functional mt-1 max-w-sm">Choose a template from the sidebar to view and manage its layout pages.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
