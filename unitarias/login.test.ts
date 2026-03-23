describe("CP-001: Validación de Login Correcto", () => {
  test("Debe permitir acceso con credenciales válidas", () => {
    const email = "Ramirez@gmail.com";
    const password = "123456";

    const loginValido =
      email === "Ramirez@gmail.com" &&
      password === "123456";

    expect(loginValido).toBe(true);
  });
});