import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";

import { loginSchema } from "@/features/auth/auth.schema";
import { prisma } from "@/lib/db/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsedCredentials = loginSchema.safeParse(rawCredentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsedCredentials.data.email },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isPasswordValid = await compare(
          parsedCredentials.data.password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          return null;
        }

        let role: "ADMIN" | "CLIENT" = "CLIENT";

        try {
          const roleRows = await prisma.$queryRaw<Array<{ role: string | null }>>`
            SELECT "role"::text AS "role"
            FROM "User"
            WHERE "id" = ${user.id}
            LIMIT 1
          `;

          role = roleRows[0]?.role === "ADMIN" ? "ADMIN" : "CLIENT";
        } catch {
          role = "CLIENT";
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "CLIENT";
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub ?? "");
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "CLIENT";
      }

      return session;
    },
  },
  trustHost: true,
});
