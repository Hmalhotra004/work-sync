"use client";

import { usePathname } from "next/navigation";
import MobileSidebar from "./MobileSidebar";
import UserButton from "./UserButton";

const pathnameMap = {
  tasks: {
    title: "My Tasks",
    description: "View all of your workspace tasks here",
  },
  members: {
    title: "Workspace Members",
    description: "Manage your workspace members",
  },
  projects: {
    title: "My Project",
    description: "View all of your project tasks here",
  },
  task: {
    title: "My Task",
    description: "View selected task details",
  },
  projectSettings: {
    title: "Project Settings",
    description: "Manage your project",
  },
  edit: {
    title: "Task Settings",
    description: "Manage this specific task details",
  },
  workspaceSettings: {
    title: "Workspace Settings",
    description: "Manage your workspace",
  },
};

const defaultMap = {
  title: "Home",
  description: "Monitor all of your projects and tasks here",
};

const Navbar = () => {
  const pathName = usePathname();
  const parts = pathName.split("/").filter(Boolean);

  let key: keyof typeof pathnameMap | undefined;

  // Detect path structure
  if (
    parts.includes("projects") &&
    parts.includes("task") &&
    parts.includes("edit")
  ) {
    key = "edit";
  } else if (parts.includes("projects") && parts.includes("settings")) {
    key = "projectSettings";
  } else if (parts.includes("members")) {
    key = "members";
  } else if (parts.includes("tasks")) {
    key = "tasks";
  } else if (parts.includes("settings")) {
    key = "workspaceSettings";
  } else if (parts.includes("task")) {
    key = "task";
  } else if (parts.includes("projects")) {
    key = "projects";
  }

  const { title, description } = key ? pathnameMap[key] : defaultMap;

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="hidden lg:flex flex-col">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <MobileSidebar />
      <UserButton />
    </nav>
  );
};

export default Navbar;
