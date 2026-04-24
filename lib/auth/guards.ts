import { redirect } from "next/navigation";

import { auth } from "@/auth";

type AuthenticatedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "CLIENT";
};

async function getAuthenticatedSessionUser(): Promise<AuthenticatedUser> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}

export async function requireAuthenticatedUser() {
  return getAuthenticatedSessionUser();
}

export async function requireClientUser() {
  const user = await getAuthenticatedSessionUser();

  if (user.role !== "CLIENT") {
    redirect("/admin");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await getAuthenticatedSessionUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}
