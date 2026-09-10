import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }
  return (
    <div className="relative flex min-h-full items-center justify-center bg-surface px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
