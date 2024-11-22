import {
  ColumnDef,
  ColumnFiltersState,
  type FilterFn,
} from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import { useSetRecoilState } from "recoil";
import { parseBalanceToFloat } from "@/lib/utils";
import DataTable from "../../../components/DataTable";
import { CarpenterType, viewCarpenterIdAtom } from "@/store/carpenter";

interface DataTableProps {
  CompKey: string;
  data: CarpenterType[];
  columnFilters?: ColumnFiltersState;
  onChange?: (cusId: string) => void;
}

function CarpenterTable({
  CompKey: key,
  data,
  columnFilters = [],
  onChange,
}: DataTableProps) {
  const setViewCarpenterIdAtom = useSetRecoilState(viewCarpenterIdAtom);

  const columns: ColumnDef<CarpenterType>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      filterFn: "fuzzy",
    },
    {
      id: "area",
      accessorKey: "area",
      header: "Area",
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
      id: "balance",
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => {
        return (
          <span
            className={
              parseBalanceToFloat(row.original.balance) < 0
                ? "text-red-500"
                : ""
            }
          >
            {row.original.balance}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const carpenterId = row.original.id;
        return (
          <Button
            size={"sm"}
            variant="outline"
            className="px-2"
            onClick={() => {
              if (onChange) {
                onChange(carpenterId);
              } else {
                setViewCarpenterIdAtom(carpenterId);
              }
            }}
          >
            {onChange ? "Select Carpenter" : "View Carpenter"}
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
        },
      }}
      message="No Carpenter Found!"
    />
  );
}

export default CarpenterTable;
