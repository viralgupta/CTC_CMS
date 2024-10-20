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
import { ViewResourceType, viewResourceAtom, viewResourceIdAtom } from "@/store/resources";
import ResourceCard from "./ResourceCard/ResourceCard";

const ViewResource = () => {
  const [viewResourceId, setViewResourceId] = useRecoilState(viewResourceIdAtom);
  const [viewResource, setViewResource] = useRecoilState(viewResourceAtom);

  React.useEffect(() => {
    if (viewResourceId) {
    request(`/miscellaneous/createGetSignedURL?resource_id=${viewResourceId}`).then((res) => {
        if(res.status != 200) return;
        setViewResource(res.data.data as ViewResourceType);
      })
    }
  }, [viewResourceId]);

  return (
    <Dialog
      key={viewResourceId}
      open={viewResourceId ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setViewResource(null);
          setViewResourceId(null);
          return;
        }
      }}
    >
      <DialogContent size="4xl">
        <DialogHeader className="hidden">
          <DialogDescription></DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
          <ResourceCard resource={viewResource}/>
      </DialogContent>
    </Dialog>
  );
};

export default ViewResource;
