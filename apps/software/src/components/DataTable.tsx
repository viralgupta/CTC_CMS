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
  type OnChangeFn,
  type RowSelectionState,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import React from "react";
import { cn } from "@/lib/utils";

type DataTableProps = {
  message: string;
  data: any[];
  columns: ColumnDef<any, any>[];
  columnFilters: ColumnFiltersState | false;
  defaultColumn?: Partial<ColumnDef<any, unknown>> | undefined;
  thin?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
};

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
}

const DataTable = ({
  message,
  data,
  columns,
  columnFilters,
  defaultColumn,
  thin,
  rowSelection,
  onRowSelectionChange
}: DataTableProps) => {
  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);

    addMeta({ itemRank });

    return itemRank.passed;
  };

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters: columnFilters ? columnFilters : undefined,
      rowSelection: rowSelection ? rowSelection : undefined,
    },
    getFilteredRowModel: columnFilters ? getFilteredRowModel() : undefined,
    defaultColumn,
    onRowSelectionChange: onRowSelectionChange ? onRowSelectionChange : undefined,
  });

  const parentRef = React.useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => thin ? 40 : 60,
    overscan: 2,
  });

  return (
    <div className="rounded-md border h-full overflow-auto hide-scroll bg-green" ref={parentRef}>
      <Table className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    width: `${header.getSize()}%`,
                    ...(header.column.columnDef.meta as any)?.headerStyle,
                  }}
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
        <TableBody
          className="w-full relative"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {table.getRowModel().rows?.length ? (
            virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <TableRow
                  className="absolute w-full flex"
                  key={row.id}
                  style={{ top: `${virtualRow.start}px` }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const totalRowSize = row
                      .getAllCells()
                      .reduce((acc, cell) => {
                        if (cell.column.getIsVisible()) {
                          return acc + cell.column.getSize();
                        } else {
                          return acc;
                        }
                      }, 0);
                    const cellSize =
                      (cell.column.getSize() * 100) / totalRowSize;
                    return (
                      <div
                        key={cell.id}
                        className={
                          ((cell.column.columnDef.meta as any)?.className ??
                            "") == ""
                            ? "py-0 flex items-center justify-center"
                            : cn(
                                "py-0 flex items-center justify-center",
                                (cell.column.columnDef.meta as any)?.className
                              )
                        }
                        style={{
                          height: `${virtualRow.size - 1}px`,
                          width: `${cellSize}%`,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {message}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
