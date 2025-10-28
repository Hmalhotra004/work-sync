"use client";

import MemberAvatar from "@/components/member/MemberAvatar";
import ProjectAvatar from "@/components/project/ProjectAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskGetManyType } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";
import TaskActions from "./TaskActions";
import TaskDate from "./TaskDate";

export const getTaskColumns = (
  projectColumn: boolean
): ColumnDef<TaskGetManyType>[] => {
  const columns: ColumnDef<TaskGetManyType>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Task Name
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.original.name;

        return <p className="line-clamp-1">{name}</p>;
      },
    },

    {
      accessorKey: "assignee",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Assignee
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { assigneeName, assigneeImage } = row.original;

        return (
          <div className="flex items-center gap-x-2 text-sm font-medium">
            <MemberAvatar
              name={assigneeName ?? ""}
              image={assigneeImage ?? undefined}
              className="size-6"
            />
            <p className="line-clamp-1">{assigneeName}</p>
          </div>
        );
      },
    },

    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Due Date
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { dueDate, status } = row.original;

        return (
          <TaskDate
            date={dueDate}
            status={status}
          />
        );
      },
    },

    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { status } = row.original;
        return <Badge variant={status}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const { id, projectId } = row.original;

        return (
          <TaskActions
            id={id}
            projectId={projectId!}
          >
            <Button
              variant="ghost"
              className="size-8 p-0"
            >
              <MoreVerticalIcon className="size-4" />
            </Button>
          </TaskActions>
        );
      },
    },
  ];

  if (projectColumn) {
    columns.splice(1, 0, {
      accessorKey: "project",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { projectName, projectImage } = row.original;

        return (
          <div className="flex items-center gap-x-2 text-sm font-medium">
            <ProjectAvatar
              name={projectName ?? ""}
              image={projectImage ?? undefined}
              className="size-6"
            />
            <p className="line-clamp-1">{projectName}</p>
          </div>
        );
      },
    });
  }

  return columns;
};
