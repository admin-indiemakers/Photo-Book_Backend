import { create } from 'zustand';
import api from '../lib/api.js';

export const useValidationStore = create((set, get) => ({
  isSystemHealthy: false,
  isCalibrating: true,
  healthDetails: {
    products: false,
    customers: false,
    orders: false,
  },
  error: null,

  // Bootstrapping function to verify database schema logic exists
  checkDatabaseIntegrity: async () => {
    set({ isCalibrating: true, error: null });

    try {
      const [productsRes, customersRes, ordersRes] = await Promise.allSettled([
        api.get('/products?limit=1'),
        api.get('/customers?limit=1'),
        api.get('/orders?limit=1')
      ]);

      // Strict Schema Column Validation
      const validateSchema = (res, requiredColumns, arrayKey) => {
        if (res.status !== 'fulfilled') return false;
        const data = res.value.data[arrayKey];
        if (!data || data.length === 0) return true; // If empty, we assume schema is valid but table is empty
        const sampleRecord = data[0];
        // Check if all required columns exist on the sample record
        return requiredColumns.every(col => Object.hasOwn(sampleRecord, col));
      };

      const health = {
        products: validateSchema(productsRes, ['sku', 'base_price', 'stock_quantity', 'attributes'], 'products'),
        customers: validateSchema(customersRes, ['id', 'email'], 'customers'), // Adjust based on your actual columns
        orders: validateSchema(ordersRes, ['id', 'order_number', 'total', 'status'], 'orders'),
      };

      const isHealthy = health.products && health.customers && health.orders;

      set({
        isSystemHealthy: isHealthy,
        healthDetails: health,
        isCalibrating: false,
        error: isHealthy ? null : 'Strict Database schema validation failed. Required columns are missing or endpoints failed.'
      });

    } catch (err) {
      set({
        isSystemHealthy: false,
        isCalibrating: false,
        error: err.message || 'System verification failed to execute.',
      });
    }
  },
}));
