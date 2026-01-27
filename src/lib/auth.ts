import bcrypt from "bcryptjs";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";

const IMPERSONATION_PASSWORD = "impersonation123";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [
    admin({
      impersonationSessionDuration: 60 * 60 * 24,
    }),
  ],
});
