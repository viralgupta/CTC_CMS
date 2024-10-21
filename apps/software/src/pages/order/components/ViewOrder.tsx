import { viewOrderAtom, viewOrderIdAtom, ViewOrderType } from "@/store/order";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRecoilState } from "recoil";
import request from "@/lib/request";
import React from "react";
import OrderItemsTable from "./OrderItemsTable";
import OrderCard from "./OrderCard";

const ViewOrder = () => {
  const [viewOrderId, setViewOrderID] = useRecoilState(viewOrderIdAtom);
  const [viewOrder, setViewOrder] = useRecoilState(viewOrderAtom);

  React.useEffect(() => {
    if (viewOrderId) {
      request(`/order/getOrder?order_id=${viewOrderId}`).then((res) => {
        if (res.status != 200) return;
        setViewOrder(res.data.data as ViewOrderType);
      });
    }
  }, [viewOrderId]);

  return (
    <Dialog
      key={viewOrderId}
      open={viewOrderId ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setViewOrder(null);
          setViewOrderID(null);
          return;
        }
      }}
    >
      <DialogContent size="7xl">
        <DialogHeader className="hidden">
          <DialogDescription></DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <OrderCard order={viewOrder}/>
        <OrderItemsTable order_items={viewOrder?.order_items} />
      </DialogContent>
    </Dialog>
  );
};

export default ViewOrder;
