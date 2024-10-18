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
import { viewArchitectAtom, viewArchitectIdAtom } from "@/store/architect";
import { useAllArchitect } from "@/hooks/architect";

const DeleteArchitect = ({
  children,
  architect_id,
}: {
  children: React.ReactNode;
  architect_id: string;
}) => {
  const { refetchArchitects } = useAllArchitect();
  const setViewArchitectId = useSetRecoilState(viewArchitectIdAtom);
  const setViewArchitect = useSetRecoilState(viewArchitectAtom);

  const handleDelete = async () => {
    const res = await request.delete("/architect/deleteArchitect", {
      data: {
        architect_id,
      },
    });
    if (res.status == 200) {
      refetchArchitects();
      setViewArchitect(null);
      setViewArchitectId(null);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete architect?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete architect
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

export default DeleteArchitect;
