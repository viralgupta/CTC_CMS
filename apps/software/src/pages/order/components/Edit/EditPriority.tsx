import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import { SelectPriority } from "../SelectFilter";
import { useAllOrders } from "@/hooks/orders";

const EditPriority = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [priority, setPriority] = React.useState(viewOrder?.priority);

  const onSubmit = async () => {
    await request.put("/order/editOrderPriority", {
      order_id: viewOrder?.id,
      priority,
    });
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SelectPriority
        value={
          priority == "High" ||
          priority == "Medium" ||
          priority == "Low"
            ? `Priority-${priority}`
            : ""
        }
        onChange={(val) => {
          const newPriority = val.replace("Priority-", "");
          if(newPriority == "High" || newPriority == "Medium" || newPriority == "Low") {
            setPriority(newPriority);
          } else {
            setPriority(undefined);
          }
        }}
      />
      <Button onClick={onSubmit}>Edit Priority</Button>
    </div>
  );
};

export default EditPriority;
