import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRecoilState } from "recoil";
import request from "@/lib/request";
import CarpenterCard from "./CarpenterCard/CarpenterCard";
import React from "react";
import CarpenterOrders from "./CarpenterOrders";
import { viewCarpenterAtom, viewCarpenterIdAtom, ViewCarpenterType } from "@/store/carpenter";
import { Skeleton } from "@/components/ui/skeleton";

const ViewCarpenter = () => {
  const [viewCarpenterId, setViewCarpenterId] = useRecoilState(viewCarpenterIdAtom);
  const [viewCarpenter, setViewCarpenter] = useRecoilState(viewCarpenterAtom);

  React.useEffect(() => {
    if (viewCarpenterId) {
    request(`/carpenter/getCarpenter?carpenter_id=${viewCarpenterId}`).then((res) => {
        if(res.status != 200) return;
        setViewCarpenter(res.data.data as ViewCarpenterType);
      })
    }
  }, [viewCarpenterId]);

  return (
    <Dialog
      key={viewCarpenterId}
      open={viewCarpenterId ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setViewCarpenter(null);
          setViewCarpenterId(null);
          return;
        }
      }}
    >
      <DialogContent size="5xl">
        <DialogHeader className="hidden">
          <DialogDescription></DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
          <CarpenterCard carpenter={viewCarpenter}/>
          {viewCarpenter ? <CarpenterOrders viewCarpenter={viewCarpenter}/> : <Skeleton className="w-full h-46" />}
      </DialogContent>
    </Dialog>
  );
};

export default ViewCarpenter;
