import {
  ColumnDef,
  ColumnFiltersState,
  type FilterFn,
} from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import { useSetRecoilState } from "recoil";
import { CustomerType, viewCustomerIDAtom } from "@/store/Customer";
import { parseBalanceToFloat } from "@/lib/utils";
import DataTable from "../../../components/DataTable";

interface DataTableProps {
  CompKey: string;
  data: CustomerType[];
  columnFilters?: ColumnFiltersState;
  onChange?: (cusId: string) => void;
}

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
}

function CustomerTable({
  CompKey: key,
  data,
  columnFilters = [],
  onChange,
}: DataTableProps) {
  const setViewCustomerIdAtom = useSetRecoilState(viewCustomerIDAtom);

  const columns: ColumnDef<CustomerType>[] = [
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
          <div
            className={
              parseBalanceToFloat(row.original.balance) < 0
                ? "text-red-500"
                : ""
            }
          >
            {row.original.balance}
          </div>
        );
      },
    },
    {
      id: "house_number",
      accessorFn: (originalRow) => {
        return originalRow.addresses[0]?.house_number ?? "--";
      },
      header: "House Number",
    },
    {
      id: "area",
      accessorFn: (originalRow) => {
        return originalRow.addresses[0]?.address_area?.area ?? "--";
      },
      header: "Area",
    },
    {
      id: "actions",
      enableHiding: false,
      meta: {
        align: "right",
      },
      cell: ({ row }) => {
        const customerId = row.original.id;
        return (
          <Button
            size={"sm"}
            variant="outline"
            className="px-2"
            onClick={() => {
              if (onChange) {
                onChange(customerId);
              } else {
                setViewCustomerIdAtom(customerId);
              }
            }}
          >
            {onChange ? "Select Customer" : "View Customer"}
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
      message="No Customers Found!"
    />
  );
}

export default CustomerTable;
