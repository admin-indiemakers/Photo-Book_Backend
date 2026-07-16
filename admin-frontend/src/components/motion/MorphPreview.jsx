import { motion } from 'framer-motion';

// Aspect ratios based on physical print sizes
const shapeVariants = {
  square: { aspectRatio: 1 / 1, width: '200px' },
  landscape: { aspectRatio: 3 / 2, width: '280px' },
  portrait: { aspectRatio: 2 / 3, width: '180px' }
};

export const MorphPreview = ({ currentShape }) => {
  return (
    <div className="flex items-center justify-center p-12 bg-canvas border border-border rounded-sm">
      <motion.div
        variants={shapeVariants}
        animate={currentShape}
        initial={currentShape}
        transition={{ 
          type: "spring", 
          stiffness: 80, 
          damping: 20, 
          mass: 1.2 
        }}
        className="bg-ink shadow-paper relative overflow-hidden"
      >
        {/* Simulating physical paper texture overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('/paper-texture.png')] mix-blend-overlay"></div>
      </motion.div>
    </div>
  );
};
