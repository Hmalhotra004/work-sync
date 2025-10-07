"use client";
import routes from "@/lib/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col">
      {routes.map((r, idx) => {
        const href = r.href.toString();
        const isActive = pathname.endsWith(href);
        const Icon = isActive ? r.activeIcon : r.icon;

        return (
          <Link
            key={idx.toString()}
            href={r.href}
          >
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md font-medium text-neutral-500 hover:text-primary transition",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <Icon className="size-5 text-neutral-500" />
              {r.label}
            </div>
          </Link>
        );
      })}
    </ul>
  );
};

export default Navigation;
