// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: process.env.WORKING_DB_URL ?? ""
  }
});
