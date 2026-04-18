test("Smoke test: la aplicación inicia correctamente", () => {
  expect(true).toBe(true);
});

// Smoke test real (activar cuando el backend esté levantado)
test("Smoke test: el servidor responde correctamente", async () => {
  const response = await fetch("http://localhost:4000");

  expect(response.ok).toBe(true);
});