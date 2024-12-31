"use client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chat } from "@/lib/db/schemas";
import { handleError } from "@/lib/utils/error-handler";
import { useState } from "react";
import { DeleteButton } from "./delete-button";

export const libraryColumns: ColumnDef<Chat>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt");
      return <div>{format(new Date(date as string), "PPp")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const chat = row.original;
      return <DeleteButton id={chat.id} />;
    },
  },
];
