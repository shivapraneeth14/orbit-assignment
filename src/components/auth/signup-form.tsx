"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!name || !email || password.length < 6) {
      toast.error("Please fill in all fields. Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error ?? "Sign up failed.");
        setLoading(false);
        return;
      }

      toast.success("Account created! Logging you in...");
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        router.push("/login");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
          <Zap className="h-6 w-6 text-white" fill="currentColor" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Create your account</h1>
        <p className="mt-1 text-sm text-stone-500">Get started with ORBIT in seconds.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700" htmlFor="name">
            Full name
          </label>
          <Input id="name" name="name" type="text" required autoComplete="name" placeholder="Ada Lovelace" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700" htmlFor="email">
            Email
          </label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700" htmlFor="password">
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
