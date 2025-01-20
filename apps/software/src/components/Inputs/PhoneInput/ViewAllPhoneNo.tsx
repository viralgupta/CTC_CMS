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
import PhoneNumberInput from "@/components/Inputs/PhoneInput/PhoneNumberInput";
import { type RecoilState, useSetRecoilState, useRecoilState } from "recoil";
import { viewCustomerType } from "@/store/customer";
import request from "@/lib/request";
import React from "react";

const ViewAllPhoneNumbers = ({
  children,
  values,
  type,
  viewObjectAtom,
  viewObjectIdAtom
}: {
  children: React.ReactNode;
  values: viewCustomerType["phone_numbers"];
  type: "customer" | "architect" | "carpenter" | "driver"
  viewObjectAtom: RecoilState<any | null>
  viewObjectIdAtom: RecoilState<number | null>
}) => {
  const setViewX = useSetRecoilState(viewObjectAtom);
  const [XId, setViewXId] = useRecoilState(viewObjectIdAtom);

  const deletePhoneNumber = ({
    children,
    phone,
  }: {
    children: React.ReactNode;
    phone: viewCustomerType["phone_numbers"][number];
  }) => {
    const [open, setOpen] = React.useState(false);

    async function handleDelete(id: number) {
      const res = await request.delete("/miscellaneous/deletePhone", {
        data: {
          phone_number_id: id,
        },
      });
      if (res.status == 200) {
        setOpen(false);
        setViewXId(null);
        setViewX(null);
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
              Number linked to the {type}.
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
        [type.concat("_id")]: XId,
      })
      .then((res) => {
        if (res.status == 200) {
          setViewX(null);
          setViewXId(null);
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
