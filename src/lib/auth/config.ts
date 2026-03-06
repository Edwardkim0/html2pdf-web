import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const admin = await db.query.admins.findFirst({
          where: eq(admins.email, credentials.email as string),
        });

        if (!admin) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          admin.passwordHash
        );

        if (!valid) return null;

        return {
          id: String(admin.id),
          email: admin.email,
          name: admin.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
});
