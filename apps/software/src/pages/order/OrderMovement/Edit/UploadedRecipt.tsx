import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import request from "@/lib/request";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSetRecoilState } from "recoil";
import { viewOrderMovementIdAtom } from "@/store/order";
import Spinner from "@/components/ui/Spinner";

const UploadedRecipt = ({
  order_movement_id,
  children,
}: {
  order_movement_id: number;
  children: React.ReactNode;
}) => {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const setViewOrderMovementId = useSetRecoilState(viewOrderMovementIdAtom);

  return (
    <Dialog
      onOpenChange={async (open) => {
        if (open) {
          await request
            .get(
              `/order/createGetSignedURLOrderMovementRecipt?id=${order_movement_id}`
            )
            .then((res) => {
              if (res.status == 200) {
                setImageSrc(res.data.data);
              }
            });
        } else {
          setImageSrc(null);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uploaded Signed Recipt</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {imageSrc ? (
          <img src={imageSrc} className="mx-auto" />
        ) : (
          <Skeleton className="w-full aspect-square" />
        )}
        {imageSrc && (
          <Button
            onClick={() => {
              setDeleteLoading(true);
              request
                .delete(
                  `/order/deleteOrderMovementRecipt`
                , {
                  data: {
                    id: order_movement_id,
                  }
                })
                .then((res) => {
                  if (res.status == 200) {
                    setImageSrc(null);
                    setViewOrderMovementId(null);
                  }
                })
                .finally(() => {
                  setDeleteLoading(false);
                });
            }}
            disabled={deleteLoading}
            className="w-full"
          >
            {deleteLoading ? <Spinner /> : "Delete Uploaded Recipt"}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadedRecipt;
