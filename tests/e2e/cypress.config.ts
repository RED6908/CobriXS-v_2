import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // CI usa `vite preview` (4173); en local suele usarse `vite` (5173). Override: CYPRESS_baseUrl
    baseUrl: "http://localhost:5173",
    specPattern: "tests/e2e/**/*.cy.{js,ts,jsx,tsx}",
    supportFile: "cypress/support/e2e.ts",
    defaultCommandTimeout: 8000,
    setupNodeEvents() {},
  },
});