import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  roots: ["<rootDir>/src", "<rootDir>/unitarias"],

  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }]
  },

  collectCoverage: true,
  coverageDirectory: "coverage",

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
    "!src/lib/supabase.ts"
  ]
};

export default config;