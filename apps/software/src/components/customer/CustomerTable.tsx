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
import { Button } from "../ui/button";
import { useSetRecoilState } from "recoil";
import { CustomerType, viewCustomerIDAtom } from "@/store/Customer";
import { parseBalanceToFloat } from "@/lib/utils";

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
      accessorKey: "addresses.0.house_number",
      header: "House Number",
    },
    {
      id: "area",
      accessorKey: "addresses.0.address_area.area",
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
                No Customers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default CustomerTable;
