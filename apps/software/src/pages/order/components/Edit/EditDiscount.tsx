import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import { Input } from "@/components/ui/input";
import { useAllOrders } from "@/hooks/orders";
import Spinner from "@/components/ui/Spinner";

const EditDiscount = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [discount, setDiscount] = React.useState(parseFloat(viewOrder?.discount ?? "0.00"));
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    setLoading(true);
    await request.put("/order/editOrderDiscount", {
      order_id: viewOrder?.id,
      discount: discount.toFixed(2),
    });
    setLoading(false);
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <Input
        type="number"
        value={discount ?? ""}
        onChange={(e) =>
          setDiscount(e.target.value ? parseFloat(e.target.value) : 0)
        }
      />
      {loading ? (
        <Button onClick={onSubmit}>Edit Discount</Button>
      ) : (
        <Button disabled><Spinner/></Button>
      )}
    </div>
  );
};

export default EditDiscount;
