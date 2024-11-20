import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type VisibilityState,
} from "@tanstack/react-table";
import { rankItem } from '@tanstack/match-sorter-utils';
import { useVirtualizer } from '@tanstack/react-virtual'
import React from "react";


type DataTableProps = {
  message: string;
  data: any[];
  columns: ColumnDef<any, any>[];
  columnFilters: ColumnFiltersState | false;
  columnVisibility?: VisibilityState | undefined
  defaultColumn?: Partial<ColumnDef<any, unknown>> | undefined
};

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
}

const DataTable = ({ message, data, columns, columnFilters, defaultColumn, columnVisibility }: DataTableProps) => {

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
  
    addMeta({ itemRank })
  
    return itemRank.passed
  }

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      columnVisibility,
      columnFilters: columnFilters ? columnFilters : undefined,
    },
    getFilteredRowModel: getFilteredRowModel(),
    defaultColumn
  });

  const parentRef = React.useRef<HTMLDivElement>(null)

  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 20,
  })

  return (
    <div className="rounded-md border h-full overflow-auto hide-scroll bg-green" ref={parentRef}>
      <div
        className="w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={(header.column.columnDef.meta as any)?.headerStyle}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              virtualizer.getVirtualItems().map((virtualRow, index) => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${
                        virtualRow.start - index * virtualRow.size
                      }px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        align={(cell.column.columnDef.meta as any)?.align}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {message}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
