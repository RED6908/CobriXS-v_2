const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

test("Integración con Supabase funciona correctamente", async () => {
  const { data, error } = await supabase
    .from("test")
    .select("*");

  expect(error).toBeNull();
  expect(data).toBeDefined();
});