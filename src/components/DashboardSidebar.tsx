"use client";

import Image from "next/image";
import Link from "next/link";
import DottedSeparator from "./dotted-separator";
import Navigation from "./Navigation";
import Projects from "./project/Projects";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const DashboardSidebar = () => {
  return (
    <aside className="h-full bg-sidebar p-4 w-full">
      <Link href={"/"}>
        <Image
          src={"/logo.svg"}
          width={164}
          height={48}
          alt="logo"
        />
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
