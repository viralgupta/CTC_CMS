import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import SearchCustomer from "@/pages/customer/components/SearchCustomer";
import { useAllOrders } from "@/hooks/orders";
import Spinner from "@/components/ui/Spinner";

const AddCustomer = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [customer_id, setCustomer_id] = React.useState(viewOrder?.customer_id);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    setLoading(true);
    await request.put("/order/addOrderCustomerId", {
      order_id: viewOrder?.id,
      customer_id
    });
    setLoading(false);
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SearchCustomer
        value={customer_id ?? undefined}
        onChange={setCustomer_id}
        className="rounded-lg"
      />
      {!loading ? (
        <Button onClick={onSubmit}>Add Customer</Button>
      ) : (
        <Button disabled><Spinner/></Button>
      )}
    </div>
  );
};

export default AddCustomer;
