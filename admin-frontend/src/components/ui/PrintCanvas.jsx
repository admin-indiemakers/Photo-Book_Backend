import { AnimatePresence } from 'framer-motion';
import { ProductCard } from './ProductCard.jsx';
import { ImageOff } from 'lucide-react';

export const PrintCanvas = ({ products, onEdit, onDelete, onViewTemplates }) => {
  if (!products || products.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-24 text-center border-dashed">
        <ImageOff size={32} className="mb-4 text-border" />
        <h3 className="font-editorial text-2xl text-ink">The Canvas is Empty</h3>
        <p className="mt-2 text-sm text-muted font-functional max-w-md">
          There are currently no print products configured for this view. Begin by adding a new product to your catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cream p-6 md:p-10 lg:p-12 border border-border shadow-paper rounded-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
        <AnimatePresence>
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{...product, onViewTemplates}} 
              onEdit={() => onEdit(product)}
              onDelete={() => onDelete(product)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
