import {
  ColumnDef,
  ColumnFiltersState,
  type FilterFn,
} from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import { useSetRecoilState } from "recoil";
import DataTable from "../../../components/DataTable";
import { DriverType, viewDriverIdAtom } from "@/store/driver";

interface DataTableProps {
  CompKey: string;
  data: DriverType[];
  columnFilters?: ColumnFiltersState;
  onChange?: (cusId: string) => void;
}

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
}

function DriverTable({
  CompKey: key,
  data,
  columnFilters = [],
  onChange,
}: DataTableProps) {
  const setViewDriverId = useSetRecoilState(viewDriverIdAtom);

  const columns: ColumnDef<DriverType>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: "ID",
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      filterFn: "fuzzy",
    },
    {
      id: "size_of_vehicle",
      accessorKey: "size_of_vehicle",
      header: "Vehicle Type",
    },
    {
      id: "activeOrders",
      accessorKey: "activeOrders",
      header: "Activer Orders",
      cell: ({ row }) => {
        const activeOrders = row.original.activeOrders;
        return (
          <span className={(activeOrders ?? 0) > 0 ? "text-green-500" :""}>{activeOrders}</span>
        );
      },
    },
    {
      id: "phone_number",
      accessorFn: (row) => {
        return `${row.phone_numbers[0].phone_number ?? "--"}`;
      },
      header: "Phone Number",
      filterFn: "fuzzy",
    },
    {
      id: "actions",
      enableHiding: false,
      meta: {
        align: "right",
      },
      cell: ({ row }) => {
        const driverId = row.original.id;
        return (
          <Button
            size={"sm"}
            variant="outline"
            className="px-2"
            onClick={() => {
              if (onChange) {
                onChange(driverId);
              } else {
                setViewDriverId(driverId);
              }
            }}
          >
            {onChange ? "Select Driver" : "View Driver"}
          </Button>
        );
      },
    },
  ];

  return (
    <DataTable
      data={data}
      key={key}
      columns={columns}
      columnFilters={columnFilters}
      defaultColumn={{
        meta: {
          headerStyle: {
            textAlign: "center",
          },
          align: "center",
        },
      }}
      columnVisibility={{
        id: false,
      }}
      message="No Driver Found!"
    />
  );
}

export default DriverTable;
