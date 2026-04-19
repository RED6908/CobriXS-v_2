import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname);

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

export default defineConfig(({ mode }) => {
  assertVercelProductionSupabaseEnv();

  const env = loadEnv(mode, rootDir, "");
  const hasSupabase =
    Boolean(env.VITE_SUPABASE_URL?.trim()) &&
    Boolean(env.VITE_SUPABASE_ANON_KEY?.trim());

  if (mode === "development") {
    if (!hasSupabase) {
      console.warn(
        "\n[vite] No se leyeron VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY desde .env\n" +
          `     Raíz del proyecto: ${rootDir}\n` +
          "     Comprueba: archivo guardado (Ctrl+S), sin espacio antes del =, y reinicia npm run dev.\n"
      );
    } else {
      console.log("[vite] Variables VITE_SUPABASE_* detectadas en .env\n");
    }
  }

  return {
    envDir: rootDir,
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: { enabled: false },
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
