import { useSetRecoilState } from "recoil";
import { Button } from "@/components/ui/button";
import { viewOrderIdAtom } from "@/store/order";
import { parseDateToString } from "@/lib/utils";
import { ViewCarpenterType} from "@/store/carpenter";
import usePagination from "@/hooks/pagination";
import PaginationDataTable from "@/components/PaginationDataTable";
import { ColumnDef } from "@tanstack/react-table";
import request from "@/lib/request";
import React from "react";

const CarpenterOrders = ({ viewCarpenter }: { viewCarpenter: ViewCarpenterType }) => {
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);
  const [loading, setLoading] = React.useState(false);

  const fetchMoreOrders = async (cursor: number) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("carpanter_id", viewCarpenter.id.toString());
      queryParams.append("cursor", cursor.toString());
      const res = await request.get('/carpanter/getCarpanterOrders?' + queryParams.toString());
      return (res.data.data ?? []) as ViewCarpenterType["orders"];
    } catch (error) {
      console.error("Error while fetching more carpanter orders", error);
      return [];
    }
  };

  const {data, hasNextPage, loadingMap, fetchMore} = usePagination({
    key: viewCarpenter.id,
    fetchNextPage: fetchMoreOrders,
    initialData: viewCarpenter.orders,
    uniqueKey: "id",
    pageSize: 10
  });

  React.useEffect(() => {
    setLoading(loadingMap.get(viewCarpenter.id) ?? false);
  }, [loadingMap, viewCarpenter.id]);

  const columns: ColumnDef<ViewCarpenterType["orders"][number]>[] = [
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
        return `${row.delivery_address?.address ?? "--"}`;
      },
      header: "Address",
    },
    {
      id: "status",
      accessorFn: (row) => {
        return `${row.status}`;
      },
      header: "Status",
    },
    {
      id: "carpanter_commision",
      accessorFn: (row) => {
        return `₹${row.carpanter_commision ?? "0.00"}`;
      },
      header: "Carpenter Comm.",
    },
    {
      id: "created_at",
      accessorFn: (row) => {
        return `${parseDateToString(row.created_at)}`;
      },
      header: "Date Created",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Button
            size={"sm"}
            onClick={() => {
              setViewOrderId(row.original.id);
            }}
          >
            View Order
          </Button>
        );
      },
      header: "View Order",
    },
  ];

  return (
    <div className="max-h-96 overflow-y-auto hide-scroll flex flex-col">
      <span className="font-sofiapro font-bold text-xl pb-4">Carpenter Orders</span>
      <PaginationDataTable
        data={data ?? []}
        key={"carpanter-orders"}
        columns={columns}
        columnFilters={false}
        defaultColumn={{
          meta: {
            headerStyle: {
              textAlign: "center",
            },
          },
        }}
        fetchNextPage={fetchMore}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={loading && data.length > 0 ? true : false}
        message="No orders found for Carpenter!"
      />      
    </div>
  );
};

export default CarpenterOrders;
