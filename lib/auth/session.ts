import "server-only";

import type { User } from "@/types/user";
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";

export class UnauthenticatedError extends Error {
  constructor(message = "Unauthenticated") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

/** Returns the signed-in user for the current request, or `null`. */
export async function getSessionUser(): Promise<User | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}

/** Returns the signed-in user, or throws `UnauthenticatedError`. */
export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) throw new UnauthenticatedError();
  return user;
}
