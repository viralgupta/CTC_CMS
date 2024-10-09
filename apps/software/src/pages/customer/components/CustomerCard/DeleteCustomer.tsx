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
import allCustomerAtom, {
  viewCustomerAtom,
  viewCustomerIDAtom,
} from "@/store/Customer";
import React from "react";

const DeleteCustomer = ({
  children,
  customerId,
}: {
  children: React.ReactNode;
  customerId: string;
}) => {
  const setAllCustomers = useSetRecoilState(allCustomerAtom);
  const setViewCustomerId = useSetRecoilState(viewCustomerIDAtom);
  const setViewCustomer = useSetRecoilState(viewCustomerAtom)

  const handleDelete = async () => {
    const res = await request.delete("/customer/deleteCustomer", {
      data: {
        customer_id: customerId,
      },
    });
    if (res.status == 200) {
      setAllCustomers([]);
      setViewCustomer(null);
      setViewCustomerId(null);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete customer?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete customer
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

export default DeleteCustomer;