import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import { SelectStatus } from "../SelectFilter";
import { useAllOrders } from "@/hooks/orders";

const EditDeliveryStatus = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [status, setStatus] = React.useState(viewOrder?.status);

  const onSubmit = async () => {
    await request.put("/order/editOrderStatus", {
      order_id: viewOrder?.id,
      status,
    });
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SelectStatus
        value={
          status == "Pending" || status == "Delivered" ? `Status-${status}` : ""
        }
        onChange={(val) => {
          const newStatus = val.replace("Status-", "");
          if (newStatus === "Pending" || newStatus === "Delivered") {
            setStatus(newStatus);
          } else {
            setStatus(undefined);
          }
        }}
      />
      <Button onClick={onSubmit}>Edit Delivery Status</Button>
    </div>
  );
};

export default EditDeliveryStatus;
