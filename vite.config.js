import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      three: "node_modules/three"
    }
  }
});
