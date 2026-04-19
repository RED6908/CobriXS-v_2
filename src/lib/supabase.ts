import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. En la raíz del proyecto, archivo .env, sin espacios alrededor del =. " +
      "Reinicia el servidor (npm run dev) después de guardar. Si usas preview, haz build con esas variables en el entorno."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
