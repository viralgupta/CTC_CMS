import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import { useAllOrders } from "@/hooks/orders";
import SearchArchitect from "@/pages/architect/components/SearchArchitect";

const EditArchitect = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
  const [architect_id, setArchitect_id] = React.useState(viewOrder?.architect_id ?? "");

  const onSubmit = async () => {
    await request.put("/order/editOrderArchitectId", {
      order_id: viewOrder?.id,
      architect_id
    });
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SearchArchitect
        value={architect_id}
        onChange={setArchitect_id}
        className="rounded-lg"
      />
      <Button onClick={onSubmit}>Edit Architect</Button>
    </div>
  );
};

export default EditArchitect;
