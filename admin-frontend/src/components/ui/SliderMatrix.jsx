import { useState, useEffect } from 'react';
import { motion, useMotionValue, animate, useTransform } from 'framer-motion';
import api from '../../lib/api.js';

export const SliderMatrix = ({ initialPrice = 1499, onChange }) => {
  const [size, setSize] = useState(50); // 0-100 mapped to physical dims
  const [weight, setWeight] = useState(50); // GSM 
  
  const displayPrice = useMotionValue(initialPrice);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);

  useEffect(() => {
    // API Debounce layer
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.post('/products/calculate-quote', {
          size,
          weight,
          initialPrice
        });
        
        setCurrentPrice(data.quote);
        if (onChange) onChange(data.quote);

        // Smoothly animate the number
        animate(displayPrice, data.quote, {
          duration: 0.6,
          ease: [0.32, 0.72, 0, 1], // Custom spring-like easing
        });
      } catch (err) {
        console.error("Failed to calculate pricing quote", err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [size, weight, initialPrice, displayPrice, onChange]);

  const formattedPrice = useMotionValue(`₹${initialPrice.toLocaleString('en-IN')}`);

  useEffect(() => {
    const unsubscribe = displayPrice.on("change", (latest) => {
      formattedPrice.set(`₹${Math.round(latest).toLocaleString('en-IN')}`);
    });
    return unsubscribe;
  }, [displayPrice, formattedPrice]);

  return (
    <div className="rounded-sm border border-border bg-cream/30 p-6 shadow-sm">
      <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
        <div>
          <h4 className="font-editorial text-lg text-ink">Dynamic Pricing Matrix</h4>
          <p className="font-functional text-[10px] uppercase tracking-widest text-muted mt-1">Adjust physical properties to calculate MSRP</p>
        </div>
        <div className="text-right">
          <p className="font-functional text-[10px] uppercase tracking-widest text-muted mb-1">Base MSRP</p>
          <motion.p className="font-editorial text-2xl font-bold text-ink">
            {formattedPrice}
          </motion.p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-functional text-xs text-ink uppercase tracking-wider">Physical Dimensions</label>
            <span className="font-functional text-xs text-muted">{Math.round(8 + (size/100)*4)} x {Math.round(10 + (size/100)*4)} inch</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={size} 
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full h-1 bg-border rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="font-functional text-xs text-ink uppercase tracking-wider">Paper Weight (GSM)</label>
            <span className="font-functional text-xs text-muted">{170 + Math.round((weight/100)*130)} GSM</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={weight} 
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full h-1 bg-border rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
