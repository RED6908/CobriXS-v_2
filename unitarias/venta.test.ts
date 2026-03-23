describe("CP-002: Cálculo del Total de Venta", () => {
  test("Debe calcular correctamente el total", () => {
    const producto1 = 50;
    const producto2 = 30;

    const total = producto1 + producto2;

    expect(total).toBe(80);
  });
});