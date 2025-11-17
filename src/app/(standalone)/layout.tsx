import Logo from "@/components/Logo";
import UserButton from "@/components/UserButton";

export default function StandaloneLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-background-100">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center h-fit">
          <Logo textClassName="tracking-normal" />

          <UserButton />
        </nav>

        <div className="flex flex-col items-center justify-center py-4">
          {children}
        </div>
      </div>
    </main>
  );
}
