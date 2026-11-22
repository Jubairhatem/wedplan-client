import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/wedplan";
const client = new MongoClient(uri);
const db = client.db("wedplan");

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "wedplan_better_auth_secret_32_chars_long_key!!",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-client-secret",
      enabled: Boolean(
        process.env.GOOGLE_CLIENT_ID &&
          process.env.GOOGLE_CLIENT_ID !== "placeholder"
      ),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: true,
      },
      isBlocked: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      businessName: {
        type: "string",
        required: false,
        input: true,
      },
      subscriptionPlan: {
        type: "string",
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Reject any attempt to register directly as admin
          if (user.role === "admin") {
            throw new Error(
              "Admin registration is not permitted via public sign-up"
            );
          }
          if (user.role && !["customer", "vendor"].includes(user.role)) {
            user.role = "customer";
          }
          return { data: user };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
