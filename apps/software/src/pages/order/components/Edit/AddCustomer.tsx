import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import SearchCustomer from "@/pages/customer/components/SearchCustomer";
import { useAllOrders } from "@/hooks/orders";

const AddCustomer = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [customer_id, setCustomer_id] = React.useState(viewOrder?.customer_id ?? "");

  const onSubmit = async () => {
    await request.put("/order/addOrderCustomerId", {
      order_id: viewOrder?.id,
      customer_id
    });
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SearchCustomer
        value={customer_id}
        onChange={setCustomer_id}
        className="rounded-lg"
      />
      <Button onClick={onSubmit}>Add Customer</Button>
    </div>
  );
};

export default AddCustomer;
