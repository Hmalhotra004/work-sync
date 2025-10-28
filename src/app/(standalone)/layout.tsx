import UserButton from "@/components/UserButton";
import Image from "next/image";
import Link from "next/link";

export default function StandaloneLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-background-100">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center h-[73px]">
          <Link href="/">
            <Image
              src={"/logo.svg"}
              alt="logo"
              width={152}
              height={56}
            />
          </Link>

          <UserButton />
        </nav>

        <div className="flex flex-col items-center justify-center py-4">
          {children}
        </div>
      </div>
    </main>
  );
}
