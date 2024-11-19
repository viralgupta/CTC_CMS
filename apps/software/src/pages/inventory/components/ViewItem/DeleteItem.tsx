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
import {
  viewItemIDAtom,
} from "@/store/Items";
import { useSetRecoilState } from "recoil";
import request from "@/lib/request";
import React from "react";

const DeleteItem = ({
  children,
  itemId,
}: {
  children: React.ReactNode;
  itemId: string;
}) => {
  const setViewItemId = useSetRecoilState(viewItemIDAtom);

  const handleDelete = async () => {
    const res = await request.delete("/inventory/deleteItem", {
      data: {
        item_id: itemId,
      },
    });
    if(res.status == 200) {
      setViewItemId(null);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete item?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete item and
            remove data from servers.
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

export default DeleteItem;