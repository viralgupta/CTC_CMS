import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { viewItemIDAtom, itemType } from "@/store/Items";
import { Button } from "@/components/ui/button";
import { useSetRecoilState } from "recoil";
import DataTable from "@/components/DataTable";

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
    <DataTable table={table} message="No Items Found"/>
  );
}

export default ItemTable;
