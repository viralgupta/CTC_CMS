import {
  ColumnDef,
  ColumnFiltersState,
  type FilterFn,
} from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import { useSetRecoilState } from "recoil";
import { parseBalanceToFloat } from "@/lib/utils";
import DataTable from "../../../components/DataTable";
import { ArchitectType, viewArchitectIdAtom } from "@/store/architect";

interface DataTableProps {
  CompKey: string;
  data: ArchitectType[];
  columnFilters?: ColumnFiltersState;
  onChange?: (cusId: number) => void;
}

function ArchitectTable({
  CompKey: key,
  data,
  columnFilters = [],
  onChange,
}: DataTableProps) {
  const setViewArchitectIdAtom = useSetRecoilState(viewArchitectIdAtom);

  const columns: ColumnDef<ArchitectType>[] = [
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
        const architectId = row.original.id;
        return (
          <Button
            size={"sm"}
            variant="outline"
            className="px-2"
            onClick={() => {
              if (onChange) {
                onChange(architectId);
              } else {
                setViewArchitectIdAtom(architectId);
              }
            }}
          >
            {onChange ? "Select Architect" : "View Architect"}
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
      message="No Architect Found!"
    />
  );
}

export default ArchitectTable;
