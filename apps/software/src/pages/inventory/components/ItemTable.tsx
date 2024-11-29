import { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
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
import React from "react";

interface DataTableProps {
  CompKey: string;
  data: itemType[];
  columnFilters?: ColumnFiltersState;
  onChange?: (val: number) => void;
}

function ItemTable({ CompKey: key, data, columnFilters = [], onChange }: DataTableProps) {
  const setViewItemIDAtom = useSetRecoilState(viewItemIDAtom);
  const [showLowQuantityItems, setShowLowQuantityItems] = React.useState(false)

  const lowQuantityItems = React.useMemo(() => {
    return data.filter((item) => item.quantity < item.min_quantity);
  }, [data])

  const columns: ColumnDef<itemType>[] = [
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
      header: () => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowLowQuantityItems((slq) => !slq)}
                  className={`px-2 ${showLowQuantityItems ? "text-primary hover:text-primary" : ""}`}
                  variant={"outline"}
                >
                  Quantity
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showLowQuantityItems ? "Show All Items" : "Show Low Quantity Items"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
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
      cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Button
            size={"sm"}
            variant="outline"
            className="px-2"
            onClick={() => {
              if (onChange) {
                onChange(itemId);
              } else {
                setViewItemIDAtom(itemId);
              }
            }}
          >
            {onChange ? "Select Item" :"View Item"}
          </Button>
        );
      },
    },
  ];

  return (
    <DataTable
      data={showLowQuantityItems ? lowQuantityItems : data}
      key={key}
      columns={columns}
      columnFilters={columnFilters}
      defaultColumn={{
        meta: {
          headerStyle: {
            textAlign: "center",
          },
        },
      }}
      message="No Items Found"
    />
  );
}

export default ItemTable;
