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
import DataTable from "@/components/DataTable";

const ViewItem = () => {
  const [itemId, setItemID] = useRecoilState(viewItemIDAtom);
  const [viewItem, setViewItem] = useRecoilState(viewItemAtom);
  const setVIewOrderID = useSetRecoilState(viewOrderIdAtom);

  React.useEffect(() => {
    if (itemId) {
      request(`/inventory/getItem?item_id=${itemId}`).then((res) => {
        if (res.status != 200) return;
        setViewItem(res.data.data as viewItemType);
      });
    }
  }, [itemId]);

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
            setVIewOrderID(row.original.order_id);
          }}
        >
          View Order
        </Button>
      ),
    },
  ];
  


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
        <div
          className="w-full max-h-96 overflow-y-auto hide-scroll flex flex-col">
          <DataTable
            data={viewItem?.order_items ?? []}
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
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewItem;
