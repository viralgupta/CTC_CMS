import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRecoilState } from "recoil";
import request from "@/lib/request";
import React from "react";
import EstimateItemTable from "./EstimateItemsTable";
import EstimateCard from "./EstimateCard";
import { viewEstimateAtom, viewEstimateIdAtom, ViewEstimateType } from "@/store/estimates";

const ViewEstimate = () => {
  const [viewEstimateId, setViewEstimateID] = useRecoilState(viewEstimateIdAtom);
  const [viewEstimate, setViewEstimate] = useRecoilState(viewEstimateAtom);

  React.useEffect(() => {
    if (viewEstimateId) {
      request(`/estimate/getEstimate?estimate_id=${viewEstimateId}`).then((res) => {
        if (res.status != 200) return;
        setViewEstimate(res.data.data as ViewEstimateType);
      });
    }
  }, [viewEstimateId]);

  return (
    <Dialog
      key={viewEstimateId}
      open={viewEstimateId ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setViewEstimate(null);
          setViewEstimateID(null);
          return;
        }
      }}
    >
      <DialogContent size="4xl">
        <DialogHeader className="hidden">
          <DialogDescription></DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <EstimateCard estimate={viewEstimate}/>
        <EstimateItemTable estimate_items={viewEstimate?.estimate_items ?? []} />
      </DialogContent>
    </Dialog>
  );
};

export default ViewEstimate;
