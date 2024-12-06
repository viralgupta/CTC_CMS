import { useSetRecoilState } from "recoil";
import { Button } from "@/components/ui/button";
import { viewOrderIdAtom } from "@/store/order";
import { parseDateToString } from "@/lib/utils";
import { ViewArchitectType } from "@/store/architect";
import { ColumnDef } from "@tanstack/react-table";
import PaginationDataTable from "@/components/PaginationDataTable";
import request from "@/lib/request";
import React from "react";
import usePagination from "@/hooks/pagination";

const ArchitectOrders = ({ viewArchitect }: { viewArchitect: ViewArchitectType }) => {
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);
  const [loading, setLoading] = React.useState(false);

  const fetchMoreOrders = async (cursor: number) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("architect_id", viewArchitect.id.toString());
      queryParams.append("cursor", cursor.toString());
      const res = await request.get('/architect/getArchitectOrders?' + queryParams.toString());
      return (res.data.data ?? []) as ViewArchitectType["orders"];
    } catch (error) {
      console.error("Error while fetching more architect orders", error);
      return [];
    }
  };

  const {data, hasNextPage, loadingMap, fetchMore} = usePagination({
    key: viewArchitect.id,
    fetchNextPage: fetchMoreOrders,
    initialData: viewArchitect.orders,
    uniqueKey: "id",
    pageSize: 10
  });

  React.useEffect(() => {
    setLoading(loadingMap.get(viewArchitect.id) ?? false);
  }, [loadingMap, viewArchitect.id]);

  const columns: ColumnDef<ViewArchitectType["orders"][number]>[] = [
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
      id: "architect_commision",
      accessorFn: (row) => {
        return `₹${row.architect_commision ?? "0.00"}`;
      },
      header: "Architect Comm.",
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
      <span className="font-sofiapro font-bold text-xl pb-4">Architect Orders</span>
      <PaginationDataTable
        data={data ?? []}
        key={"architect-orders"}
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
        message="No orders found for Architect!"
      />
    </div>
  );
};

export default ArchitectOrders;
