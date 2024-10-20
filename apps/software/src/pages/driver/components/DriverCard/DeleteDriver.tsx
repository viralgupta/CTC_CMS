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
import { useAllDrivers } from "@/hooks/driver";
import { viewDriverAtom, viewDriverIdAtom } from "@/store/driver";
import React from "react";

const DeleteDriver = ({
  children,
  driver_id,
}: {
  children: React.ReactNode;
  driver_id: string;
}) => {
  const { refetchDrivers } = useAllDrivers();
  const setViewDriverId = useSetRecoilState(viewDriverIdAtom);
  const setViewDriver = useSetRecoilState(viewDriverAtom);

  const handleDelete = async () => {
  const res = await request.delete("/driver/deleteDriver", {
      data: {
        driver_id,
      },
    });
    if (res.status == 200) {
      refetchDrivers();
      setViewDriver(null);
      setViewDriverId(null);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete driver?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete driver
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

export default DeleteDriver;
