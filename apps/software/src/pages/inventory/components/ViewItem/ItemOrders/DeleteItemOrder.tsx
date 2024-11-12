import React from 'react'
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
import request from '@/lib/request';
import { viewItemAtom, viewItemIDAtom } from '@/store/Items';
import { useSetRecoilState } from 'recoil';

const DeleteItemOrder = ({
  children,
  id
}: {
  children: React.ReactNode;
  id: string;
}) => {
  const setViewItem = useSetRecoilState(viewItemAtom);
  const setViewItemId = useSetRecoilState(viewItemIDAtom);

  const handleDelete = async () => {
    const res =await request.delete("/inventory/deleteItemOrder", {
      data: {
        id
      }
    });
    if(res.status == 200){
      setViewItem(null);
      setViewItemId(null);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete item order?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete item order and remove data from servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteItemOrder