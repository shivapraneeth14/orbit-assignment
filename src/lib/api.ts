import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function getSessionUser(): Promise<
  { id: string; email: string; name: string } | null
> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
  };
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "You must be signed in to perform this action." },
        { status: 401 }
      ),
    };
  }
  return { user, response: null };
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
