import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import SelectOrderItems from "../Input/SelectOrderItems/SelectOrderItems";
import { useAllOrders } from "@/hooks/orders";

const EditOrderItems = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [order_items, setOrderItems] = React.useState(
    (viewOrder?.order_items ?? []).map((oi) => {
      return {
        item_id: oi.item_id,
        quantity: oi.quantity,
        rate: oi.rate,
        total_value: (oi.total_value).toString() ?? "0",
        carpanter_commision: oi.carpanter_commision ?? "0.00",
        carpanter_commision_type: oi.carpanter_commision_type ?? undefined,
        architect_commision: oi.architect_commision ?? "0.00",
        architect_commision_type: oi.architect_commision_type ?? undefined,
      };
    })
  );

  const onSubmit = async () => {
    await request.put("/order/editOrderItems", {
      order_id: viewOrder?.id,
      order_items,
    });
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SelectOrderItems
        value={order_items}
        onChange={(value) => {
          setOrderItems(
            value.map((oi) => {
              return {
                item_id: oi.item_id,
                quantity: oi.quantity,
                rate: oi.rate,
                total_value: oi.total_value,
                carpanter_commision: oi.carpanter_commision ?? "0.00",
                carpanter_commision_type:
                  oi.carpanter_commision_type ?? undefined,
                architect_commision: oi.architect_commision ?? "0.00",
                architect_commision_type:
                  oi.architect_commision_type ?? undefined,
              };
            })
          );
        }}
      />
      <Button onClick={onSubmit}>Edit Order Items</Button>
    </div>
  );
};

export default EditOrderItems;
