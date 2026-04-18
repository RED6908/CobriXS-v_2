// Test real (activar cuando el servidor esté corriendo)

test("Health check del servidor", async () => {
  const response = await fetch("http://localhost:4000/health");
  expect(response.status).toBe(200);
});

// Ejemplo de test básico.
// No forma parte del flujo de CI/CD automatizado.
/*
test("Health check básico", () => {
  expect(true).toBe(true);
});
*/