import { motion } from 'framer-motion';
import { Pencil, Trash2, ImageOff } from 'lucide-react';

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export const ProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        layout: { type: 'spring', stiffness: 300, damping: 25 },
        opacity: { duration: 0.2 }
      }}
      className="group relative flex flex-col"
    >
      {/* Physical Book / Item Representation */}
      <motion.div 
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative aspect-[4/5] w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border"
      >
        {/* Book spine simulation effect */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/5 border-r border-border z-10" />
        
        {product.images?.[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="h-full w-full object-cover mix-blend-multiply opacity-90 p-1" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cream">
            <ImageOff size={32} className="text-border" />
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-ink/50 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-4 z-20">
          <button 
            onClick={onEdit}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink transition-transform hover:scale-110 shadow-paper"
            title="Edit Product"
          >
            <Pencil size={16} />
          </button>
          <button 
            onClick={onDelete}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-danger text-white transition-transform hover:scale-110 shadow-paper"
            title="Delete Product"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </motion.div>

      {/* Product Metadata */}
      <div className="mt-6 flex flex-col items-center text-center">
        <h3 className="font-editorial text-xl text-ink tracking-wide">{product.name}</h3>
        <p className="mt-1 font-functional text-[10px] uppercase tracking-[0.2em] text-muted">
          {product.category.replace('_', ' ')}
        </p>
        
        {/* Dynamic Attributes (Size & Formats) */}
        {product.attributes && (product.attributes.sizes || product.attributes.supported_formats) && (
          <div className="mt-2 flex flex-col items-center gap-1 font-functional text-[10px] text-muted uppercase tracking-wider bg-cream px-3 py-2 rounded-sm border border-border w-full">
             {product.attributes.sizes && <div className="text-ink text-center w-full truncate" title={product.attributes.sizes}>{product.attributes.sizes}</div>}
             {product.attributes.sizes && product.attributes.supported_formats && <div className="w-full border-t border-border my-1" />}
             {product.attributes.supported_formats && (
               <div className="flex flex-wrap justify-center gap-1">
                 {product.attributes.supported_formats.slice(0, 4).map((f, i) => (
                   <span key={i} className="bg-border/50 px-1 py-0.5 rounded">{f}</span>
                 ))}
                 {product.attributes.supported_formats.length > 4 && <span>+ more</span>}
               </div>
             )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <span className="font-functional text-sm text-ink">{formatCurrency(product.base_price)}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className={`font-functional text-xs ${product.stock_quantity < 10 ? 'text-danger' : 'text-success'}`}>
            {product.stock_quantity} available
          </span>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (product.onViewTemplates) product.onViewTemplates(product);
          }}
          className="mt-4 w-full py-2 bg-cream text-ink text-xs font-bold uppercase tracking-widest border border-border hover:bg-brand-50 hover:text-brand-600 transition-colors rounded-sm"
        >
          View Templates
        </button>
      </div>
    </motion.div>
  );
};
