"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { SafeActionFn } from "next-safe-action";
import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { handleError } from "@/lib/utils/error-handler";

import { Button } from "../ui/button";
import { revalidatePath } from "next/cache";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumnName: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumnName,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });
  const selectedRowsLength = table.getFilteredSelectedRowModel().rows.length;
  const filterCol = table.getColumn(searchColumnName);
  async function handleDeleteTasks() {
    try {
      setIsDeleting(true);
      const ids = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => (row.original as any)["id"]);

      const response = await fetch(`/api/chat?id=${ids.join(",")}`, {
        method: "DELETE",
        next: {
          tags: ["library"],
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete chats");
      }

      toast.success("Chats deleted successfully!");
      table.resetRowSelection();
      window.location.reload(); // Refresh to update the table
    } catch (error) {
      toast.error("Failed to delete chats");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center w-full justify-between">
        <div className="flex gap-x-3 items-center">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedRowsLength} of {table.getFilteredRowModel().rows.length}{" "}
            row(s) selected.
          </div>
          {selectedRowsLength ? (
            <Button
              onClick={handleDeleteTasks}
              variant="destructive"
              loading={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          ) : (
            <></>
          )}
        </div>
        <Input
          placeholder="Search..."
          value={(filterCol?.getFilterValue() as string) ?? ""}
          onChange={(event) => filterCol?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
