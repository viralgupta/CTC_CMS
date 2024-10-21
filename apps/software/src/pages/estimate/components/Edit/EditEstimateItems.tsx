import { useRecoilState, useSetRecoilState } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import SelectEstimateItems from "../Input/SelectEstimateItems/SelectEstimateItems";
import { viewEstimateAtom, viewEstimateIdAtom } from "@/store/estimates";
import { useAllEstimates } from "@/hooks/estimate";

const EditEstimateItems = ({ closeDialog }: { closeDialog?: () => void }) => {
  const [viewEstimate, setViewEstimate] = useRecoilState(viewEstimateAtom);
  const setViewEstimateId = useSetRecoilState(viewEstimateIdAtom);

  const { refetchEstimates } = useAllEstimates();
  const [estimate_items, set_estimate_items] = React.useState(
    (viewEstimate?.estimate_items ?? []).map((ei) => {
      return {
        item_id: ei.item_id,
        quantity: ei.quantity,
        rate: ei.rate,
        total_value: ei.total_value.toString() ?? "0.00",
      };
    })
  );

  const onSubmit = async () => {
    await request.put("/estimate/editEstimateItems", {
      estimate_id: viewEstimate?.id,
      estimate_items
    });
    closeDialog && closeDialog();
    setViewEstimate(null);
    setViewEstimateId(null);
    refetchEstimates();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SelectEstimateItems
        value={estimate_items}
        onChange={(value) => {
          set_estimate_items(
            value.map((ei) => {
              return {
                item_id: ei.item_id,
                quantity: ei.quantity,
                rate: ei.rate,
                total_value: ei.total_value,
              };
            })
          );
        }}
      />
      <Button onClick={onSubmit}>Edit Estimate Items</Button>
    </div>
  );
};

export default EditEstimateItems;
