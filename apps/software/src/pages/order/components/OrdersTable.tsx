import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import { useSetRecoilState } from "recoil";
import { OrderRow, viewOrderIdAtom } from "@/store/order";
import { parseDateToString } from "@/lib/utils";
import { useAllOrders } from "@/hooks/orders";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import PaginationDataTable from "@/components/PaginationDataTable";

function OrdersTable() {
  const setViewOrderIdAtom = useSetRecoilState(viewOrderIdAtom);
  const { orders, filter, orderLoadingMap, fetchMoreOrders, orderHasNextPageMap } = useAllOrders();
  const [loading, setLoading] = useState(orderLoadingMap.get(filter));
  const [hasNextPage, setHasNextPage] = useState(orderHasNextPageMap.get(filter));

  const columns: ColumnDef<OrderRow>[] = [
    {
      id: "customer_name",
      accessorFn: (row) => {
        return `${row.customer?.name ?? "--"}`;
      },
      header: "Customer Name",
    },
    {
      id: "house_no",
      accessorFn: (row) => {
        return `${row.delivery_address?.house_number ?? "--"}`;
      },
      header: "House No",
    },
    {
      id: "address",
      accessorFn: (row) => {
        return `${row.delivery_address?.address ? (row.delivery_address?.address.length > 15 ? row.delivery_address?.address.slice(0, 15).concat("...") : row.delivery_address?.address) : "--"}`;
      },
      header: "Address",
    },
    {
      id: "priority",
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <span
          className={
            row.original.priority == "High"
              ? "text-red-500"
              : row.original.priority == "Medium"
                ? "text-yellow-500"
                : "text-green-500"
          }
        >
          {row.original.priority.toUpperCase()}
        </span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Delivery Status",
      cell: ({ row }) => {
        return (
          <span
            className={
              row.original.status == "Pending"
                ? "text-red-500"
                : "text-green-500"
            }
          >
            {row.original.status.toUpperCase()}
          </span>
        );
      },
    },
    {
      id: "payment_status",
      accessorKey: "payment_status",
      header: "Payment Status",
      cell: ({ row }) => {
        return (
          <span
            className={
              row.original.payment_status == "UnPaid"
                ? "text-red-500"
                : row.original.payment_status == "Partial"
                  ? "text-yellow-500"
                  : "text-green-500"
            }
          >
            {row.original.payment_status.toUpperCase()}
          </span>
        );
      },
    },
    {
      id: "updated_at",
      accessorFn: (or) => {
        return parseDateToString(or.updated_at);
      },
      header: "Updated At",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const orderId = row.original.id;
        return (
          <Button
            size={"sm"}
            variant="outline"
            className="px-2"
            onClick={() => {
              setViewOrderIdAtom(orderId);
            }}
          >
            View Order
          </Button>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(orderLoadingMap.get(filter))
  }, [filter, orderLoadingMap.get(filter)])

  useEffect(() => {
    setHasNextPage(orderHasNextPageMap.get(filter))
  }, [filter, orderHasNextPageMap.get(filter)])

  if(loading) return <Skeleton className="w-full flex-1"/>
  
  return (
    <PaginationDataTable
      data={orders[filter]}
      key={filter}
      columns={columns}
      columnFilters={false}
      defaultColumn={{
        meta: {
          headerStyle: {
            textAlign: "center",
          },
        },
      }}
      columnVisibility={{
        id: false,
      }}
      fetchNextPage={fetchMoreOrders}
      hasNextPage={hasNextPage ?? false}
      isFetchingNextPage={loading && orders[filter].length > 0 ? true : false}
      message="No orders found for particular filter!"
    />
  );
}

export default OrdersTable;
