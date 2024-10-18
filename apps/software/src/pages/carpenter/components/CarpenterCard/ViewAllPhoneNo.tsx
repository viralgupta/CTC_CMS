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
import { viewCarpenterAtom, viewCarpenterIdAtom } from "@/store/carpenter";

const ViewAllPhoneNumbers = ({
  children,
  values,
  carpenter_id,
}: {
  children: React.ReactNode;
  values: viewCustomerType["phone_numbers"];
  carpenter_id: string;
}) => {
  const setViewCarpenterId = useSetRecoilState(viewCarpenterIdAtom);
  const setViewCarpenter = useSetRecoilState(viewCarpenterAtom);

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
        setViewCarpenterId(null);
        setViewCarpenter(null);
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
              Number linked to the carpenter.
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
        carpenter_id,
      })
      .then((res) => {
        if (res.status == 200) {
          setViewCarpenter(null);
          setViewCarpenterId(null);
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
