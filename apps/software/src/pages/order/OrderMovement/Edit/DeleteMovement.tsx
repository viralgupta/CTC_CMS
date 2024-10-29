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
import React from "react";
import { useRecoilState } from "recoil";
import { viewOrderMovementIdAtom } from "@/store/order";

const DeleteMovement = ({
  children,
  refetchFunction,
}: {
  children: React.ReactNode;
  refetchFunction?: () => void
}) => {
  const [viewOrderMovementId, setViewOrderMovementId] = useRecoilState(viewOrderMovementIdAtom);

  const handleDelete = async () => {
  const res = await request.delete("/order/deleteMovement", {
      data: {
        id: viewOrderMovementId
      },
    });
    if (res.status == 200) {
      refetchFunction && refetchFunction();
      setViewOrderMovementId(null);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete movement?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the order movement and remove data from servers.
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

export default DeleteMovement;
