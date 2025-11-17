"use client";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isSignIn = pathname === "/sign-in";
  const isAuth = pathname === "/sign-in" || pathname === "/sign-up";

  return (
    <main className="bg-background-100 min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center">
          <Logo textClassName="tracking-normal" />

          {isAuth && (
            <Button
              variant="secondary"
              asChild
            >
              <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
                {isSignIn ? "Sign Up" : "Sign In"}
              </Link>
            </Button>
          )}
        </nav>
        <div className="flex flex-col items-center justify-center pt-4 md:pt-14">
          {children}
        </div>
      </div>
    </main>
  );
}
