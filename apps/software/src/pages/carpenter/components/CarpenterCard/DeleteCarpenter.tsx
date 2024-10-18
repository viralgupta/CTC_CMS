import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import request from "@/lib/request";
import { useSetRecoilState } from "recoil";
import React from "react";
import { viewCarpenterAtom, viewCarpenterIdAtom } from "@/store/carpenter";
import { useAllCarpenter } from "@/hooks/carpenter";

const DeleteCarpenter = ({
  children,
  carpenter_id,
}: {
  children: React.ReactNode;
  carpenter_id: string;
}) => {
  const { refetchCarpenters } = useAllCarpenter();
  const setViewCarpenterId = useSetRecoilState(viewCarpenterIdAtom);
  const setViewCarpenter = useSetRecoilState(viewCarpenterAtom);

  const handleDelete = async () => {
    const res = await request.delete("/carpenter/deleteCarpanter", {
      data: {
        carpanter_id: carpenter_id,
      },
    });
    if (res.status == 200) {
      refetchCarpenters();
      setViewCarpenter(null);
      setViewCarpenterId(null);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete carpenter?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete carpenter
            and remove data from servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCarpenter;
