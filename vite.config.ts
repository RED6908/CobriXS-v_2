import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

/** En Vercel solo exigimos Supabase en producción; los previews pueden usar vars de entorno "Preview". */
function assertVercelProductionSupabaseEnv(): void {
  if (!process.env.VERCEL) return;
  if (process.env.VERCEL_ENV !== "production") return;
  const url = process.env.VITE_SUPABASE_URL?.trim();
  const key = process.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en Vercel (entorno Production). Project → Settings → Environment Variables."
    );
  }
}

export default defineConfig(() => {
  assertVercelProductionSupabaseEnv();

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "apple-touch-icon.png"],
        manifest: {
          name: "CobriXS - Sistema POS",
          short_name: "CobriXS",
          description: "Sistema profesional de punto de venta",
          theme_color: "#0d6efd",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
  };
});
