import {
  ColumnDef,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import { useSetRecoilState } from "recoil";
import DataTable from "../../../components/DataTable";
import { AddressType, viewAddressIdAtom } from "@/store/address";
import { Check, X } from "lucide-react";
import { viewCustomerIDAtom } from "@/store/Customer";

interface DataTableProps {
  CompKey: string;
  data: AddressType[];
  columnFilters?: ColumnFiltersState;
}

function AddressTable({ CompKey: key, data, columnFilters = [] }: DataTableProps) {
  const setViewAddressId = useSetRecoilState(viewAddressIdAtom);
  const setViewCustomerId = useSetRecoilState(viewCustomerIDAtom);

  const columns: ColumnDef<AddressType>[] = [
    {
      id: "id",
      accessorKey: "id",
    },
    {
      id: "customer_name",
      accessorFn: ( originalRow ) => {
        return originalRow.customer.name
      },
      header: "Customer Name"
    },
    {
      id: "house_number",
      accessorKey: "house_number",
      header: "House No",
      filterFn: "fuzzy"
    },
    {
      id: "address",
      accessorKey: "address",
      header: "Address",
      filterFn: "fuzzy",
    },
    {
      id: "address_area",
      accessorFn: (originalRow) => {
        return originalRow.address_area.area
      },
      header: "Area",
    },
    {
      id: "is_primary",
      accessorKey: "isPrimary",
      header: "Primary",
      cell: ({ row }) => {
        if(row.original.isPrimary){
          return <Check className="mx-auto stroke-primary" />
        } else {
          return <X className="mx-auto" />
        }
      }
    },
    {
      id: "view_customer",
      enableHiding: false,
      meta: {
        align: "right",
      },
      cell: ({ row }) => {
        const customerId = row.original.customer.id;
        return (
          <Button
            size={"sm"}
            variant="outline"
            className="px-2"
            onClick={() => {
              setViewCustomerId(customerId);
            }}
          >
            View Customer
          </Button>
        );
      },
    },
    {
      id: "view_address",
      enableHiding: false,
      meta: {
        align: "right",
      },
      cell: ({ row }) => {
        const addressId = row.original.id;
        return (
          <Button
            size={"sm"}
            variant="outline"
            className="px-2"
            onClick={() => {
              setViewAddressId(addressId);
            }}
          >
            View Address
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
      message="No Address Found!"
    />
  );
}

export default AddressTable;
