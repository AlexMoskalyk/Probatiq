import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("@/src/data/env/server", () => ({
  env: {
    DB_USER: "test",
    DB_PASSWORD: "test",
    DB_HOST: "localhost",
    DB_PORT: "5432",
    DB_NAME: "test",
    DATABASE_URL: "postgres://test:test@localhost:5432/test",
    ARCJET_KEY: "ajkey_stub",
    CLERK_SECRET_KEY: "sk_test_stub",
    HUME_API_KEY: "hume_stub",
    HUME_SECRET_KEY: "hume_secret_stub",
    GEMINI_API_KEY: "gemini_stub",
  },
}));

vi.mock("@/src/data/env/client", () => ({
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_stub",
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/dashboard",
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/dashboard",
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??= "pk_test_stub";
process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ??= "/sign-in";
process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ??= "/dashboard";
process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ??= "/dashboard";
process.env.CLERK_SECRET_KEY ??= "sk_test_stub";
process.env.CLERK_WEBHOOK_SIGNING_SECRET ??= "whsec_stub";
process.env.ARCJET_KEY ??= "ajkey_stub";
process.env.ARCJET_ENV ??= "development";
process.env.DB_USER ??= "test";
process.env.DB_PASSWORD ??= "test";
process.env.DB_HOST ??= "localhost";
process.env.DB_PORT ??= "5432";
process.env.DB_NAME ??= "test";
process.env.HUME_API_KEY ??= "hume_stub";
process.env.HUME_SECRET_KEY ??= "hume_secret_stub";
process.env.GEMINI_API_KEY ??= "gemini_stub";
