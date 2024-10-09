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
import {
  viewCustomerAtom,
  viewCustomerIDAtom,
  viewCustomerType,
} from "@/store/Customer";
import React from "react";
import AddressInput from "@/components/Inputs/AddressInput/AddressInput";
import { addressType } from "@type/api/miscellaneous";
import { z } from "zod";

const ViewAllAddresses = ({
  children,
  values,
  customer_id
}: {
  children: React.ReactNode;
  values: viewCustomerType["addresses"];
  customer_id: string,
}) => {
  const setViewCustomerId = useSetRecoilState(viewCustomerIDAtom);
  const setViewCustomer = useSetRecoilState(viewCustomerAtom);

  const deleteAddress = ({
    children,
    addressId,
  }: {
    children: React.ReactNode;
    addressId: string;
  }) => {
    const [open, setOpen] = React.useState(false);

    async function handleDelete(id: string) {
      const res = await request.delete("/customer/deleteAddress", {
        data: {
          address_id: id
        },
      });
      if (res.status == 200) {
        setOpen(false);
        setViewCustomerId(null);
        setViewCustomer(null);
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

  const AddAddress = (
    data: z.infer<typeof addressType>
  ) => {
    request.post("/customer/addAddress", {
      ...data,
      customer_id: customer_id
    }).then(res => {
      if (res.status == 200) {
        setViewCustomer(null);
        setViewCustomerId(null);
      }
    })
  };

  return (
    <AddressInput
      deleteAddress={deleteAddress}
      AddAddress={AddAddress}
      values={values.map((address) => {
        return {
          house_number: address.house_number,
          address_area_id: address.address_area.id,
          address_area: address.address_area.area,
          address: address.address,
          city: address.city,
          state: address.state,
          cordinates: {
            latitude: address.latitude,
            longitude: address.latitude,
          },
          isPrimary: address.isPrimary,
          id: address.id,
        };
      })}
      children={children}
    />
  );
};

export default ViewAllAddresses;