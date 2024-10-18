import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import SearchCustomer from "@/pages/customer/components/SearchCustomer";
import { useAllOrders } from "@/hooks/orders";

const EditDriver = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [driver_id, setDriver_id] = React.useState(viewOrder?.driver_id ?? "");

  const onSubmit = async () => {
    await request.put("/order/editOrderArchitectId", {
      order_id: viewOrder?.id,
      driver_id
    });
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SearchCustomer
        value={driver_id}
        onChange={setDriver_id}
        className="rounded-lg"
      />
      <Button onClick={onSubmit}>Edit Driver</Button>
    </div>
  );
};

export default EditDriver;
