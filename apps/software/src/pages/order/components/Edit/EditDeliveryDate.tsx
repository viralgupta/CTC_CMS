import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import { DatePicker } from "@/components/ui/date-picker";
import { useAllOrders } from "@/hooks/orders";

const EditDeliveryDate = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [delivery_date, setDeliveryDate] = React.useState(
    viewOrder?.delivery_date
  );

  const onSubmit = async () => {
    await request.put("/order/editOrderDeliveryDate", {
      order_id: viewOrder?.id,
      delivery_date,
    });
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <DatePicker
        value={delivery_date ?? undefined}
        onChange={setDeliveryDate}
        className="w-full"
      />
      <Button onClick={onSubmit}>Edit Delivery Date</Button>
    </div>
  );
};

export default EditDeliveryDate;
