import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
  getSortedRowModel
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { itemType } from '@/store/inventory/Items';
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";


interface DataTableProps {
  data: itemType[];
  columnFilters?: ColumnFiltersState;
}

const columns: ColumnDef<itemType>[] = [
  {
    id: "id",
    accessorKey: "id",
    header: "ID",
  },
  {
    id: "category",
    accessorKey: "category",
    header: "Category",
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Name" 
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const lessQuantity = row.original.quantity < row.original.min_quantity;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger><div className={lessQuantity ? "text-red-500" : ""}>{row.original.quantity}</div></TooltipTrigger>
            <TooltipContent>
              <p>Minimum Quantity: {row.original.min_quantity}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  },
  {
    id: "min_quantity",
    accessorKey: "min_quantity",
    header: "Min Quantity",
  },
  {
    id: "sale_rate",
    accessorKey: "sale_rate",
    header: "Rate",
  },
  {
    id: "rate_dimension",
    accessorKey: "rate_dimension",
    header: "Rate Dimension",
  },
];

function ItemTable({ data, columnFilters = [] }: DataTableProps) {

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility: {
        "id": false,
        "min_quantity": false,
      },
      columnFilters: columnFilters  
    },
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemTable;
