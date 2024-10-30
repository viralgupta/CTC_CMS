import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import SearchAddressInput from "../Input/SearchAddressInput";
import { useAllOrders } from "@/hooks/orders";
import Spinner from "@/components/ui/Spinner";

const EditDeliveryAddress = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [delivery_address_id, setDeliveryAddressId] = React.useState(
    viewOrder?.delivery_address_id
  );
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    setLoading(true)
    await request.put("/order/editOrderDeliveryAddressId", {
      order_id: viewOrder?.id,
      delivery_address_id,
    });
    setLoading(false)
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SearchAddressInput
        filterCustomerId={viewOrder?.customer_id ?? undefined}
        value={delivery_address_id ?? undefined}
        onChange={setDeliveryAddressId}
      />
      {!loading ? (
        <Button onClick={onSubmit}>Edit Delivery Address</Button>
      ) : (
        <Button disabled><Spinner/></Button>
      )}
    </div>
  );
};

export default EditDeliveryAddress;
