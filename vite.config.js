import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion', 'react-hot-toast'],
          'icons-vendor': ['react-icons/md', 'react-icons/gi', 'react-icons/bi', 'react-icons/fa'],
          
          // Feature-based chunks
          'dashboard': ['./src/components/dashboard/Dashboard.jsx'],
          'recipes': ['./src/components/recipes/Recipes.jsx'],
          'inventory': ['./src/components/inventory/Inventory.jsx'],
          'cooking': [
            './src/components/cooking/InProgress.jsx',
            './src/components/cooking/Cooking.jsx'
          ],
          'reports': [
            './src/components/reports/InventoryReport.jsx',
            './src/components/reports/RecipeReport.jsx',
            './src/components/reports/ProductionReport.jsx',
            './src/components/reports/RevenueReport.jsx',
            './src/components/reports/StockLogsReport.jsx',
            './src/components/reports/TransferReport.jsx'
          ],
          'admin': [
            './src/components/users/Users.jsx',
            './src/components/departments/Departments.jsx',
            './src/components/analytics/Analytics.jsx',
            './src/components/BulkDataManager.jsx'
          ]
        }
      }
    }
  }
});
