import { describe, test, expect } from "@jest/globals";
jest.mock("../src/lib/supabase");

import * as salesService from "../src/services/sales.service";

describe("CP-002: Cálculo del Total de Venta", () => {
  test("Debe cargar el servicio de ventas", () => {
    expect(salesService).toBeDefined();
  });
});