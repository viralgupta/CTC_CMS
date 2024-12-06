import { useSetRecoilState } from "recoil";
import { Button } from "@/components/ui/button";
import { viewOrderIdAtom, viewOrderMovementIdAtom } from "@/store/order";
import { parseDateToString } from "@/lib/utils";
import { ViewDriverType } from "@/store/driver";
import { ColumnDef } from "@tanstack/react-table";
import PaginationDataTable from "@/components/PaginationDataTable";
import usePagination from "@/hooks/pagination";
import request from "@/lib/request";
import React from "react";

const DriverOrderMovements = ({ viewDriver }: { viewDriver: ViewDriverType }) => {
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);
  const setViewOrderMovementId = useSetRecoilState(viewOrderMovementIdAtom);
  const [loading, setLoading] = React.useState(false);

  const fetchMoreOrderMovements = async (cursor: number) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("driver_id", viewDriver.id.toString());
      queryParams.append("cursor", cursor.toString());
      const res = await request.get('/driver/getDriverOrderMovements?' + queryParams.toString());
      return (res.data.data ?? []) as ViewDriverType["order_movements"];
    } catch (error) {
      console.error("Error while fetching more driver order movements", error);
      return [];
    }
  }

  const {data, hasNextPage, loadingMap, fetchMore} = usePagination({
    key: viewDriver.id,
    fetchNextPage: fetchMoreOrderMovements,
    initialData: viewDriver.order_movements,
    uniqueKey: "id",
    pageSize: 10
  });

  React.useEffect(() => {
    setLoading(loadingMap.get(viewDriver.id) ?? false);
  }, [loadingMap, viewDriver.id]);

  const columns: ColumnDef<ViewDriverType['order_movements'][number]>[] = [
    {
      id: "type",
      accessorKey: "type",
      header: "Type",
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={
            row.original.status == "Completed"
              ? "text-green-500"
              : "text-red-500"
          }
        >
          {row.original.status.toUpperCase()}
        </span>
      ),
    },
    {
      id: "customer",
      accessorFn: (row) => {
        return `${row.order.customer?.name ?? "--"}`;
      },
      header: "Customer",
    },
    {
      id: "address",
      accessorFn: (row) => {
        return `${row.order.delivery_address?.house_number ?? "--"}, ${row.order.delivery_address?.address ?? "--"}`;
      },
      header: "Address",
    },
    {
      id: "amount",
      accessorFn: (row) => {
        return `${row.labour_frate_cost.toFixed(2)}`;
      },
      header: "Amount",
    },
    {
      id: "date_created",
      accessorFn: (row) => {
        return `${parseDateToString(row.created_at)}`;
      },
      header: "Date Created",
    },
    {
      id: "action-view-order",
      header: "View Order",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Button
          size={"sm"}
          onClick={() => {
            setViewOrderId(row.original.order.id);
          }}
        >
          View Order
        </Button>
        );
      },
    },
    {
      id: "action-view-movement",
      header: "View Movement",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Button
          size={"sm"}
          onClick={() => {
            setViewOrderMovementId(row.original.id);
          }}
        >
          View Movement
        </Button>
        );
      },
    },
  ];


  return (
    <div className="max-h-96 overflow-y-auto hide-scroll flex flex-col">
      <span className="font-sofiapro font-bold text-xl mb-2">All Movements</span>
      <PaginationDataTable
        data={data}
        key={"driver_order_movements"}
        columns={columns}
        columnFilters={false}
        defaultColumn={{
          meta: {
            headerStyle: {
              textAlign: "center",
            },
          },
        }}
        message="No orders movement found for driver!"
        fetchNextPage={fetchMore}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={loading && data.length > 0 ? true : false}
      />
    </div>
  );
};

export default DriverOrderMovements;
