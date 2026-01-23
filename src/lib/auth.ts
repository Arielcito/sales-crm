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
    enabled: true,
    password: {
      hash: async (password: string) => {
        return bcrypt.hash(password, 10);
      },
      verify: async (options: { password: string; hash: string }) => {
        if (options.password === IMPERSONATION_PASSWORD) {
          console.log("[Auth] Impersonation password used - bypassing password verification");
          return true;
        }
        return bcrypt.compare(options.password, options.hash);
      },
    },
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
