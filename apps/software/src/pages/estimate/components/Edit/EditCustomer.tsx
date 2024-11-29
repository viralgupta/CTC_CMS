import { useRecoilState, useSetRecoilState } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import SearchCustomer from "@/pages/customer/components/SearchCustomer";
import { viewEstimateAtom, viewEstimateIdAtom } from "@/store/estimates";

const EditCustomer = ({ closeDialog }: { closeDialog?: () => void }) => {
  const [viewEstimate, setViewEstimate] = useRecoilState(viewEstimateAtom);
  const setViewEstimateId = useSetRecoilState(viewEstimateIdAtom);
  const [customer_id, setCustomer_id] = React.useState(viewEstimate?.customer_id);

  const onSubmit = async () => {
    await request.put("/estimate/editEstimateCustomerId", {
      estimate_id: viewEstimate?.id,
      customer_id,
    });
    closeDialog && closeDialog();
    setViewEstimate(null);
    setViewEstimateId(null);
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SearchCustomer
        value={customer_id}
        onChange={setCustomer_id}
        className="rounded-lg"
      />
      <Button onClick={onSubmit}>Edit Customer</Button>
    </div>
  );
};

export default EditCustomer;
