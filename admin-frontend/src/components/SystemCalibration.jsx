import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useValidationStore } from '../store/validationStore.js';

export const SystemCalibration = ({ children }) => {
  const { isCalibrating, isSystemHealthy, checkDatabaseIntegrity } = useValidationStore();

  useEffect(() => {
    // Only check if we are not calibrating and haven't checked yet
    // Typically this runs once on mount.
    checkDatabaseIntegrity();
  }, [checkDatabaseIntegrity]);

  if (isCalibrating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="h-12 w-12 border-y-2 border-ink rounded-full animate-spin mb-6" />
          <h2 className="font-editorial text-2xl text-ink">Calibrating System</h2>
          <p className="font-functional text-xs uppercase tracking-widest text-muted mt-2">
            Verifying Core Schemas
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isSystemHealthy) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card max-w-md text-center border-brand-500/20 bg-white"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500 mb-6">
            <span className="font-bold text-lg">!</span>
          </div>
          <h2 className="font-editorial text-2xl text-ink mb-2">System Interruption</h2>
          <p className="font-functional text-sm text-muted mb-6">
            The database schemas (Products, Customers, Orders) could not be verified. 
            Ensure your backend is running and the database is properly migrated.
          </p>
          <button 
            onClick={() => checkDatabaseIntegrity()} 
            className="btn-primary w-full"
          >
            Retry Connection
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};
