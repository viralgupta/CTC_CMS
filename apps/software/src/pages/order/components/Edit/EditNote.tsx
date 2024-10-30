  import { viewOrderAtom } from "@/store/order";
  import { useRecoilValue } from "recoil";
  import { Textarea } from "@/components/ui/textarea";
  import { Button } from "@/components/ui/button";
  import React from "react";
  import request from "@/lib/request";
  import { useAllOrders } from "@/hooks/orders";
import Spinner from "@/components/ui/Spinner";

  const EditNote = ({
    closeDialog
  }: {
    closeDialog?: () => void;
  }) => {
    const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();
    const [note, setNote] = React.useState(viewOrder?.note ?? "");
    const [loading, setLoading] = React.useState(false);

    const onSubmit = async () => {
      setLoading(true);
      await request.put("/order/editOrderNote", {
        order_id: viewOrder?.id,
        note
      })
      setLoading(false);
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
      {loading ? (
        <Button onClick={onSubmit}>Edit Note</Button>
      ) : (
        <Button disabled><Spinner/></Button>
      )}      </div>
    );
  };

  export default EditNote;