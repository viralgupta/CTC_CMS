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
import { allAddressAtom } from "@/store/address";
import { viewCustomerAtom, viewCustomerIDAtom } from "@/store/customer";
import React from "react";
import { useSetRecoilState } from "recoil";

const DeleteAddress = ({
  children,
  addressId,
  onDelete,
  resetViewCustomer = true
}: {
  children: React.ReactNode;
  addressId: number;
  onDelete?: () => void;
  resetViewCustomer?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);
  const setAllAddresses = useSetRecoilState(allAddressAtom);
  const setViewCustomerId = useSetRecoilState(viewCustomerIDAtom);
  const setViewCustomer = useSetRecoilState(viewCustomerAtom);

  async function handleDelete(id: number) {
    const res = await request.delete("/customer/deleteAddress", {
      data: {
        address_id: id
      },
    });
    if (res.status == 200) {
      setOpen(false);
      setAllAddresses([]);
      onDelete && onDelete();
      if (resetViewCustomer) {
        setViewCustomer(null);
        setViewCustomerId(null);
      }
    }
  }

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete address?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete Address linked to the customer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleDelete(addressId);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAddress;