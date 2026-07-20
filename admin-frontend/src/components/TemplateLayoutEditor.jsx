import { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, LayoutTemplate } from 'lucide-react';

export default function TemplateLayoutEditor({ template, onBack, hideBack }) {
  // Mock layout configurations for demo
  const pages = Array.from({ length: template.pages }, (_, i) => ({
    id: i + 1,
    layoutType: i === 0 ? 'cover' : i % 3 === 0 ? 'full-bleed' : 'split',
    image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&q=80`
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        {!hideBack && (
          <button 
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream hover:bg-brand-50 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h2 className="font-editorial text-2xl text-ink">Layout: {template.name}</h2>
          <p className="text-sm font-functional text-muted">{template.pages} Pages Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {pages.map((page) => (
          <div key={page.id} className="flex flex-col gap-2">
            <div className="aspect-[3/4] bg-cream border border-border flex flex-col items-center justify-center p-4 relative group cursor-pointer hover:border-brand-500 transition-colors">
              <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/50 px-3 py-1 rounded">Change Layout</span>
              </div>
              
              <LayoutTemplate size={24} className="text-muted mb-2" />
              <span className="text-[10px] font-functional uppercase tracking-widest text-muted">{page.layoutType}</span>
            </div>
            <div className="text-center font-functional text-xs font-medium text-ink">
              Page {page.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
