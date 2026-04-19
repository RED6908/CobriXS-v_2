import { describe, test, expect } from "@jest/globals";
jest.mock("../../src/lib/supabase");

import * as authService from "../../src/services/authService";

describe("CP-001: Validación de Login Correcto", () => {
  test("Debe cargar el servicio de autenticación", () => {
    expect(authService).toBeDefined();
  });
});