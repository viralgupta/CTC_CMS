import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import { Input } from "@/components/ui/input";
import { useAllOrders } from "@/hooks/orders";

const EditLabourAndFrate = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [lfc, setLfc] = React.useState(viewOrder?.labour_frate_cost);

  const onSubmit = async () => {
    await request.put("/order/editOrderLabourAndFrateCost", {
      order_id: viewOrder?.id,
      labour_frate_cost: lfc,
    });
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <Input
        type="number"
        value={lfc ?? ""}
        onChange={(e) =>
          setLfc(e.target.value ? parseFloat(e.target.value) : undefined)
        }
      />
      <Button onClick={onSubmit}>Edit Labour And Frate</Button>
    </div>
  );
};

export default EditLabourAndFrate;
