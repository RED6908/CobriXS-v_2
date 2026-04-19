require('dotenv').config();

console.log("Verificando entorno de CobriXS...\n");

const requiredVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "NODE_ENV",
  "PORT"
];

const missing = requiredVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error("Error: faltan variables de entorno:");
  missing.forEach(v => console.error(" - " + v));
  process.exit(1);
}

console.log("Entorno configurado correctamente");
console.log(" Listo para ejecutar CobriXS");