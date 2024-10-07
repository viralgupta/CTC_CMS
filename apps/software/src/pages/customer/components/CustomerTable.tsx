import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import { useSetRecoilState } from "recoil";
import { CustomerType, viewCustomerIDAtom } from "@/store/Customer";
import { parseBalanceToFloat } from "@/lib/utils";
import DataTable from "../../../components/DataTable";

interface DataTableProps {
  data: CustomerType[];
  columnFilters?: ColumnFiltersState;
}

function CustomerTable({ data, columnFilters = [] }: DataTableProps) {
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
    },
    {
      id: "balance",
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => {
        return (
          <div className={parseBalanceToFloat(row.original.balance) < 0 ? "text-red-500" : ""}>
            {row.original.balance}
          </div>
        );
      },
    },
    {
      id: "house_number",
      accessorFn: (originalRow) => {
        return originalRow.addresses[0]?.house_number ?? "--"
      },
      header: "House Number",
    },
    {
      id: "area",
      accessorFn: (originalRow) => {
        return originalRow.addresses[0]?.address_area?.area ?? "--"
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
              setViewCustomerIdAtom(customerId);
            }}
          >
            View Customer
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
      },
      columnFilters: columnFilters,
    },
    getFilteredRowModel: getFilteredRowModel(),
    defaultColumn: {
      meta: {
        headerStyle: {
          textAlign: "center",
        },
        align: "center",
      },
    },
  });

  return (
    <DataTable table={table} message="No Customers Found!"/>
  );
}

export default CustomerTable;
