import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import SearchCustomer from "@/pages/customer/components/SearchCustomer";
import { useAllOrders } from "@/hooks/orders";
import Spinner from "@/components/ui/Spinner";

const EditCarpenter = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [carpenter_id, setCarpenter_id] = React.useState(viewOrder?.carpanter_id ?? "");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    setLoading(true);
    await request.put("/order/editOrderCarpanterId", {
      order_id: viewOrder?.id,
      carpenter_id
    });
    setLoading(false);
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
      {loading ? (
        <Button onClick={onSubmit}>Add Customer</Button>
      ) : (
        <Button disabled><Spinner/></Button>
      )}
    </div>
  );
};

export default EditCarpenter;
