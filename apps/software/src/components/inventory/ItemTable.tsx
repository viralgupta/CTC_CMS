import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
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
} from "@/components/ui/tooltip";
import { viewItemIDAtom, itemType } from "@/store/Items";
import { Button } from "../ui/button";
import { useSetRecoilState } from "recoil";

interface DataTableProps {
  data: itemType[];
  columnFilters?: ColumnFiltersState;
}

function ItemTable({ data, columnFilters = [] }: DataTableProps) {
  const setViewItemIDAtom = useSetRecoilState(viewItemIDAtom);

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
      header: "Name",
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
              <TooltipTrigger>
                <div className={lessQuantity ? "text-red-500" : ""}>
                  {row.original.quantity}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Minimum Quantity: {row.original.min_quantity}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
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
      header: "Dimension",
    },
    {
      id: "actions",
      enableHiding: false,
      meta: {
        align: "right"
      },
      cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Button size={"sm"} variant="outline" className="px-2" onClick={() => {setViewItemIDAtom(itemId)}}>
            View Items
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility: {
        id: false,
        min_quantity: false,
      },
      columnFilters: columnFilters,
    },
    getFilteredRowModel: getFilteredRowModel(),
    defaultColumn: {
      meta: {
        headerStyle: {
          textAlign: "center"
        },
        align: "center"
      },
    }
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={(header.column.columnDef.meta as any)?.headerStyle}>
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
                  <TableCell key={cell.id} align={(cell.column.columnDef.meta as any)?.align}>
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
}

export default ItemTable;
