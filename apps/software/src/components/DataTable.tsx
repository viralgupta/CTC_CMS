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


type DataTableProps = {
  message: string;
  data: any[];
  columns: ColumnDef<any, any>[];
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState | undefined
  defaultColumn?: Partial<ColumnDef<any, unknown>> | undefined
};

const DataTable = ({ message, data, columns, columnFilters, defaultColumn, columnVisibility }: DataTableProps) => {

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
  
    addMeta({ itemRank })
  
    return itemRank.passed
  }

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
      columnFilters,
    },
    getFilteredRowModel: getFilteredRowModel(),
    defaultColumn
  });

  return (
    <div className="rounded-md border">
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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    align={(cell.column.columnDef.meta as any)?.align}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
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
