import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { viewItemAtom, viewItemIDAtom, viewItemType } from "@/store/Items";
import { useRecoilState } from "recoil";
import request from "@/lib/request";
import ItemCard from "./ItemCard";
import { Button } from "@/components/ui/button";
import { useSetRecoilState } from "recoil";
import { viewOrderIdAtom } from "@/store/order";
import React from "react";
import { calculateCommissionFromTotalCommission } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import PaginationDataTable from "@/components/PaginationDataTable";
import { Skeleton } from "@/components/ui/skeleton";
import usePagination from "@/hooks/pagination";

const ViewItem = () => {
  const [itemId, setItemID] = useRecoilState(viewItemIDAtom);
  const [viewItem, setViewItem] = useRecoilState(viewItemAtom);

  React.useEffect(() => {
    if (itemId) {
      request(`/inventory/getItem?item_id=${itemId}`).then((res) => {
        if (res.status != 200) return;
        setViewItem(res.data.data as viewItemType);
      });
    }
  }, [itemId]);

  return (
    <Dialog
      key={itemId}
      open={itemId ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setItemID(null);
          setViewItem(null);
          return;
        }
      }}
    >
      <DialogContent size="6xl">
        <DialogHeader className="hidden">
          <DialogDescription></DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <ItemCard item={viewItem} />
        <div className="w-full max-h-96 overflow-y-auto hide-scroll flex flex-col">
        {viewItem ? <OrderItemsTable viewItem={viewItem} /> : <Skeleton className="w-full h-46" />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const OrderItemsTable = ({ viewItem }: { viewItem: viewItemType }) => {
  const setViewOrderID = useSetRecoilState(viewOrderIdAtom);
  const [loading, setLoading] = React.useState(false);

  const fetchMoreOrderItems = async (cursor: number) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("item_id", viewItem.id.toString());
      queryParams.append("cursor", cursor.toString());
      const res = await request.get('/inventory/getMoreItemOrderItems?' + queryParams.toString());
      return (res.data.data ?? []) as viewItemType["order_items"];
    } catch (error) {
      console.error("Error while fetching more order items", error);
      return [];
    }
  }

  const {data, hasNextPage, loadingMap, fetchMore} = usePagination({
    key: viewItem.id,
    fetchNextPage: fetchMoreOrderItems,
    initialData: viewItem.order_items,
    uniqueKey: "id",
    pageSize: 10
  });

  React.useEffect(() => {
    setLoading(loadingMap.get(viewItem.id) ?? false);
  }, [loadingMap, viewItem.id]);  

  const columns: ColumnDef<viewItemType["order_items"][number]>[] = [
    {
      id: "customer_name",
      accessorFn: (row) => row.order.customer?.name ?? "--",
      header: "Customer Name",
    },
    {
      id: "quantity",
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      id: "rate",
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => {
        const rate = row.original.rate;
        return `₹${rate.toFixed(2)} per ${viewItem?.rate_dimension ?? "unit"}`;
      },
    },
    {
      id: "total_value",
      accessorKey: "total_value",
      header: "Total Value",
      cell: ({ row }) => `₹${row.original.total_value}`,
    },
    {
      id: "architect_commission",
      accessorKey: "architect_commission",
      header: "Architect Commission",
      cell: ({ row }) => {
        const commission = row.original.architect_commision;
        return commission
          ? `₹${commission} ${calculateCommissionFromTotalCommission(commission, row.original.architect_commision_type, row.original.total_value, row.original.quantity).bracket}`
          : "--";
      },
    },
    {
      id: "carpenter_commission",
      accessorKey: "carpenter_commission",
      header: "Carpenter Commission",
      cell: ({ row }) => {
        const commission = row.original.carpanter_commision;
        return commission
          ? `₹${commission} ${calculateCommissionFromTotalCommission(commission, row.original.carpanter_commision_type, row.original.total_value, row.original.quantity).bracket}`
          : "--";
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          size={"sm"}
          onClick={() => {
            setViewOrderID(row.original.order_id);
          }}
        >
          View Order
        </Button>
      ),
    },
  ];

  return (
    <PaginationDataTable
      data={data ?? []}
      key={"Order Items"}
      columns={columns}
      columnFilters={false}
      defaultColumn={{
        meta: {
          headerStyle: {
            textAlign: "center",
          },
        },
      }}
      message="No Item's Orders Found!"
      fetchNextPage={fetchMore}
      hasNextPage={hasNextPage ?? false}
      isFetchingNextPage={loading && data.length > 0 ? true : false}
    />
  )
}


export default ViewItem;
