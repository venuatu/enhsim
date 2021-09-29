import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import compress from "vite-plugin-compress";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // compress(),
  ],
  base: "/enhsim/",
  output: {
    format: "esm",
    sourcemap: true,
  },
  build: {
    rollupOptions: {
      output: {
        sourcemap: true,
        format: "esm",
      },
      // manualChunks(id) {
      //   if (id.includes('.json')) {
      //     return 'json';
      //   }
      // },
    },
  },
});
