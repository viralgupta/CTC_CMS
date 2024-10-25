  import { viewOrderAtom } from "@/store/order";
  import { useRecoilValue } from "recoil";
  import { Textarea } from "@/components/ui/textarea";
  import { Button } from "@/components/ui/button";
  import React from "react";
  import request from "@/lib/request";
  import { useAllOrders } from "@/hooks/orders";

  const EditNote = ({
    closeDialog
  }: {
    closeDialog?: () => void;
  }) => {
    const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
    const [note, setNote] = React.useState(viewOrder?.note ?? "");

    const onSubmit = async () => {
      await request.put("/order/editOrderNote", {
        order_id: viewOrder?.id,
        note
      })
      closeDialog && closeDialog();
    refetchOrders();
    }

    return (
      <div className="space-y-4 flex flex-col">
        <Textarea
          defaultValue={note}
          onChange={(e) => setNote(e.target.value)}
          className="resize-none overflow-y-scroll hide-scroll"
        />
        <Button onClick={onSubmit}>Edit Note</Button>
      </div>
    );
  };

  export default EditNote;