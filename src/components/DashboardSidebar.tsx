"use client";

import Image from "next/image";
import Link from "next/link";
import Navigation from "./Navigation";
import Projects from "./project/Projects";
import DottedSeparator from "./ui/dotted-separator";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const DashboardSidebar = () => {
  return (
    <aside className="h-full bg-sidebar p-4 w-full">
      <Link href={"/"}>
        <div className="flex items-center gap-x-2">
          <Image
            src={"/logo.svg"}
            width={40}
            height={40}
            alt="logo"
          />
          <h1 className="tracking-wide font-semibold text-[22px]">WorkSync</h1>
        </div>
      </Link>

      <DottedSeparator className="my-4" />

      <WorkspaceSwitcher />

      <DottedSeparator className="my-4" />

      <Navigation />

      <DottedSeparator className="my-4" />

      <Projects />
    </aside>
  );
};

export default DashboardSidebar;
