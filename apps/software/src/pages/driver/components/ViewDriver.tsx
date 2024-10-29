import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRecoilState } from "recoil";
import request from "@/lib/request";
import DriverCard from "./DriverCard/DriverCard";
import React from "react";
import DriverOrderMovements from "./DriverOrderMovements";
import { viewDriverAtom, viewDriverIdAtom, ViewDriverType } from "@/store/driver";

const ViewDriver = () => {
  const [viewDriverId, setViewDriverId] = useRecoilState(viewDriverIdAtom);
  const [viewDriver, setViewDriver] = useRecoilState(viewDriverAtom);

  React.useEffect(() => {
    if (viewDriverId) {
    request(`/driver/getDriver?driver_id=${viewDriverId}`).then((res) => {
        if(res.status != 200) return;
        setViewDriver(res.data.data as ViewDriverType);
      })
    }
  }, [viewDriverId]);

  return (
    <Dialog
      key={viewDriverId}
      open={viewDriverId ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setViewDriver(null);
          setViewDriverId(null);
          return;
        }
      }}
    >
      <DialogContent size="6xl">
        <DialogHeader className="hidden">
          <DialogDescription></DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
          <DriverCard driver={viewDriver}/>
          <DriverOrderMovements />
      </DialogContent>
    </Dialog>
  );
};

export default ViewDriver;
