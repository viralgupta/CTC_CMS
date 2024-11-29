import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import { Button } from "@/components/ui/button";
import React from "react";
import request from "@/lib/request";
import SearchArchitect from "@/pages/architect/components/SearchArchitect";
import Spinner from "@/components/ui/Spinner";

const EditArchitect = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const [architect_id, setArchitect_id] = React.useState(viewOrder?.architect_id);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    setLoading(true);
    await request.put("/order/editOrderArchitectId", {
      order_id: viewOrder?.id,
      architect_id
    });
    setLoading(false);
    closeDialog && closeDialog();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SearchArchitect
        value={architect_id ?? undefined}
        onChange={setArchitect_id}
        className="rounded-lg"
      />
      {!loading ? (
        <Button onClick={onSubmit}>Edit Architect</Button>
      ) : (
        <Button disabled><Spinner/></Button>
      )}
    </div>
  );
};

export default EditArchitect;
