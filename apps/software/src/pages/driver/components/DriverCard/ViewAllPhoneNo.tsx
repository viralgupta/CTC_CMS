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
import { viewCustomerType } from "@/store/Customer";
import PhoneNumberInput from "@/components/Inputs/PhoneInput/PhoneNumberInput";
import React from "react";
import { viewDriverAtom, viewDriverIdAtom } from "@/store/driver";

const ViewAllPhoneNumbers = ({
  children,
  values,
  driver_id,
}: {
  children: React.ReactNode;
  values: viewCustomerType["phone_numbers"];
  driver_id: string;
}) => {
  const setViewDriverId = useSetRecoilState(viewDriverIdAtom);
  const setViewDriver = useSetRecoilState(viewDriverAtom);

  const deletePhoneNumber = ({
    children,
    phone,
  }: {
    children: React.ReactNode;
    phone: viewCustomerType["phone_numbers"][number];
  }) => {
    const [open, setOpen] = React.useState(false);

    async function handleDelete(id: string) {
      const res = await request.delete("/miscellaneous/deletePhone", {
        data: {
          phone_number_id: id,
        },
      });
      if (res.status == 200) {
        setOpen(false);
        setViewDriverId(null);
        setViewDriver(null);
      }
    }

    return (
      <AlertDialog onOpenChange={setOpen} open={open}>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete phone number?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete Phone
              Number linked to the driver.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete(phone.id);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const AddPhoneNumber = (
    phone: Omit<viewCustomerType["phone_numbers"][number], "id">
  ) => {
    request
      .post("/miscellaneous/createPhone", {
        ...phone,
        driver_id,
      })
      .then((res) => {
        if (res.status == 200) {
          setViewDriver(null);
          setViewDriverId(null);
        }
      });
  };

  return (
    <PhoneNumberInput
      deleteNumber={deletePhoneNumber}
      value={values}
      AddNumber={AddPhoneNumber}
      children={children}
    />
  );
};

export default ViewAllPhoneNumbers;
