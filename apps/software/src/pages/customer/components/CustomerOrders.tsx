import { viewCustomerAtom, viewCustomerType } from "@/store/customer";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { viewOrderIdAtom } from "@/store/order";
import { parseDateToString } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";

const CustomerOrders = () => {
  const viewCustomer = useRecoilValue(viewCustomerAtom);
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);

  if (!viewCustomer) return <Skeleton className="w-full h-46" />;

  const columns: ColumnDef<viewCustomerType["orders"][number]>[] = [
  {
    id: "total_order_amount",
    accessorKey: "total_order_amount",
    header: "Total Amount",
  },
  {
    id: "priority",
    accessorKey: "priority",
    header: "Priority",
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span className={status == "Pending" ? "text-red-500" : "text-green-500"}>
          {status}
        </span>
      );
    }
  },
  {
    id: "payment_status",
    accessorKey: "payment_status",
    header: "Payment Status",
    cell: ({ row }) => {
      const paymentStatus = row.original.payment_status;
      return (
        <span className={paymentStatus == "UnPaid" ? "text-red-500" : paymentStatus == "Partial" ? "text-yellow-300" : "text-green-500"}>
          {paymentStatus}
        </span>
      );
    }
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Date Created",
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      return parseDateToString(createdAt);
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const orderId = row.original.id;
      return (
        <Button
          size={"sm"}
          onClick={() => {
            setViewOrderId(orderId);
          }}
        >
          View Order
        </Button>
      );
    }
  },
  ];

  return (
    <div className="max-h-96 overflow-y-auto hide-scroll flex flex-col">
      <DataTable
        data={viewCustomer.orders}
        key={"Customer Orders"}
        columns={columns}
        columnFilters={false}
        defaultColumn={{
          meta: {
            headerStyle: {
              textAlign: "center",
            },
          },
        }}
        message="No Customers Orders Found!"
      />
    </div>
  );
};

export default CustomerOrders;
