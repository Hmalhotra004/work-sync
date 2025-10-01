import { db } from "@/db";
import * as schema from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "./sendEmail";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    revokeSessionsOnPasswordReset: true,
  },
  plugins: [
    emailOTP({
      storeOTP: "encrypted",
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await sendEmail(
            email,
            "Login to your account by otp",
            `Your verification code is: ${otp}`
          );
        } else if (type === "email-verification") {
          await sendEmail(
            email,
            "Verify your email address",
            `Your verification code is: ${otp}`
          );
        } else {
          await sendEmail(
            email,
            "Verify email to reset password",
            `Your verification code is: ${otp}`
          );
        }
      },
    }),
  ],
});
