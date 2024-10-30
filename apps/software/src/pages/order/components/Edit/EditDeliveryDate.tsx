import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import { DatePicker } from "@/components/ui/date-picker";
import { useAllOrders } from "@/hooks/orders";
import Spinner from "@/components/ui/Spinner";

const EditDeliveryDate = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [delivery_date, setDeliveryDate] = React.useState(
    viewOrder?.delivery_date?.toISOString()
  );
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    setLoading(true);
    await request.put("/order/editOrderDeliveryDate", {
      order_id: viewOrder?.id,
      delivery_date,
    });
    setLoading(false);
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
      {!loading ? (
        <Button onClick={onSubmit}>Edit Delivery Date</Button>
      ) : (
        <Button disabled><Spinner/></Button>
      )}
    </div>
  );
};

export default EditDeliveryDate;
