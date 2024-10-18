import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import SearchCustomer from "@/pages/customer/components/SearchCustomer";
import { useAllOrders } from "@/hooks/orders";

const EditCarpenter = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [carpenter_id, setCarpenter_id] = React.useState(viewOrder?.carpanter_id ?? "");

  const onSubmit = async () => {
    await request.put("/order/editOrderCarpanterId", {
      order_id: viewOrder?.id,
      carpenter_id
    });
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SearchCustomer
        value={carpenter_id}
        onChange={setCarpenter_id}
        className="rounded-lg"
      />
      <Button onClick={onSubmit}>Edit Carpenter</Button>
    </div>
  );
};

export default EditCarpenter;
