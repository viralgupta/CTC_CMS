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
import { RecoilState, useRecoilState, useSetRecoilState } from "recoil";
import React from "react";

const DeleteAlert = ({
  children,
  type,
  refetchFunction,
  viewObjectAtom,
  viewObjectIdAtom
}: {
  children: React.ReactNode;
  refetchFunction?: () => void
  type: "customer" | "architect" | "carpanter" | "driver" | "resource" | "estimate"
  viewObjectAtom: RecoilState<any | null>
  viewObjectIdAtom: RecoilState<string | null>
}) => {
  const setViewX = useSetRecoilState(viewObjectAtom);
  const [XId, setViewXId] = useRecoilState(viewObjectIdAtom);

  const deleteUrl = `/${type !== "carpanter" ? type !== "resource" ? type : "miscellaneous" : "carpenter"}/delete${(type.charAt(0).toUpperCase() + type.slice(1))}`
  const handleDelete = async () => {
  const res = await request.delete(deleteUrl, {
      data: {
        [type.concat("_id")]: XId,
      },
    });
    if (res.status == 200) {
      refetchFunction && refetchFunction();
      setViewX(null);
      setViewXId(null);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete {type}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete {type} and remove data from servers.
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

export default DeleteAlert;
