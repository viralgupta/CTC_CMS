import {
  viewOrderAtom,
  viewOrderIdAtom,
  viewOrderMovementIdAtom,
} from "@/store/order";
import React from "react";
import request from "@/lib/request";
import { useSetRecoilState } from "recoil";
import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { viewMovementType } from "../OrderMovement";

const ChangeStatus = ({
  orderMovement,
}: {
  orderMovement: viewMovementType;
}) => {
  const setViewOrderMovementId = useSetRecoilState(viewOrderMovementIdAtom);
  const setViewOrder = useSetRecoilState(viewOrderAtom);
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit() {
    try {
      setLoading(true);
      const res = await request.put("/order/editMovementStatus", {
        id: orderMovement.id,
      });
      setLoading(false);
      if (res.status == 200) {
        setViewOrderMovementId(null);
        setViewOrderId(null);
        setViewOrder(null);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Button disabled={loading || orderMovement.type == "RETURN"} className="w-full" variant={"outline"} onClick={onSubmit}>
      {!loading && `Mark As ${!orderMovement.delivered ? "Completed" : "Pending"}`}
      {loading && <Spinner/>}
    </Button>
  );
};

export default ChangeStatus;
