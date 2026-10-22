import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

// Served from https://aidemolab.github.io/aim-property-investment-demo/
export default defineConfig({
  base: '/aim-property-investment-demo/',
  plugins: [react(), tailwindcss()],
});
