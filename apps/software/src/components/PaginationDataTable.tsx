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
import { rankItem } from "@tanstack/match-sorter-utils";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import React from "react";

type DataTableProps = {
  message: string;
  data: any[];
  columns: ColumnDef<any, any>[];
  columnFilters: ColumnFiltersState | false;
  columnVisibility?: VisibilityState | undefined;
  defaultColumn?: Partial<ColumnDef<any, unknown>> | undefined;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
};

const PaginationDataTable = ({
  message,
  data,
  columns,
  columnFilters,
  defaultColumn,
  columnVisibility,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
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
      columnVisibility,
      columnFilters: columnFilters ? columnFilters : undefined,
    },
    getFilteredRowModel: columnFilters ? getFilteredRowModel() : undefined,
    defaultColumn,
  });

  const parentRef = React.useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 2,
  });

  React.useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= rows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    rows.length,
    isFetchingNextPage,
    virtualizer.getVirtualItems(),
  ]);


  return (
    <div className="rounded-md border flex-1 overflow-y-scroll hide-scroll" ref={parentRef}>
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
                  }}                >
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
        <TableBody style={{ height: `${virtualizer.getTotalSize()}px` }} className="w-full relative"
        >
          {table.getRowModel().rows?.length ? (
            virtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > rows.length - 1;
              const row = rows[virtualRow.index];
              return (
                <TableRow
                  className="absolute w-full flex"
                  key={row?.id ?? "loader"}
                  style={{ top: `${virtualRow.start}px` }}
                >
                  {!isLoaderRow ? (
                    row.getVisibleCells().map((cell) => {
                      const totalRowSize = row.getAllCells()
                        .reduce((acc, cell) => {
                          if (cell.column.getIsVisible()) {
                            return acc + cell.column.getSize();
                          } else {
                            return acc;
                          }
                        }, 0);
                      const cellSize = (cell.column.getSize() * 100) / totalRowSize;
                      return (
                        <td
                          key={cell.id}
                          className="py-0 flex items-center justify-center"
                          style={{
                            height: `${virtualRow.size - 1}px`,
                            width: `${cellSize}%`,
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })
                  ) : (
                    <TableCell colSpan={columns.length} className="text-center w-full animate-pulse">
                      {hasNextPage ? "Loading..." : "No more data available!"}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center align-middle">
                {message}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaginationDataTable;
