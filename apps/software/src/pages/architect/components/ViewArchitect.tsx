import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRecoilState } from "recoil";
import request from "@/lib/request";
import ArchitectCard from "./ArchitectCard/ArchitectCard";
import React from "react";
import ArchitectOrders from "./ArchitectOrders";
import { viewArchitectAtom, viewArchitectIdAtom, ViewArchitectType } from "@/store/architect";

const ViewArchitect = () => {
  const [viewArchitectId, setViewArchitectId] = useRecoilState(viewArchitectIdAtom);
  const [viewArchitect, setViewArchitect] = useRecoilState(viewArchitectAtom);

  React.useEffect(() => {
    if (viewArchitectId) {
    request(`/architect/getArchitect?architect_id=${viewArchitectId}`).then((res) => {
        if(res.status != 200) return;
        setViewArchitect(res.data.data as ViewArchitectType);
      })
    }
  }, [viewArchitectId]);

  return (
    <Dialog
      key={viewArchitectId}
      open={viewArchitectId ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setViewArchitect(null);
          setViewArchitectId(null);
          return;
        }
      }}
    >
      <DialogContent size="4xl">
        <DialogHeader className="hidden">
          <DialogDescription></DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
          <ArchitectCard architect={viewArchitect}/>
          <ArchitectOrders />
      </DialogContent>
    </Dialog>
  );
};

export default ViewArchitect;
