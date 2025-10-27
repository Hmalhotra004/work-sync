"use client";

import { Button } from "@/components/ui/button";
import { TaskType } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDownIcon } from "lucide-react";

export const taskColumns: ColumnDef<TaskType>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Task Name
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
];
