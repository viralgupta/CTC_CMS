import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  CircleUserRound,
  CreditCard,
  Edit2Icon,
  FileTextIcon,
  MapPinIcon,
  PhoneIcon,
  Trash2,
  Trash2Icon,
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import request from "@/lib/request";
import { useRecoilState, useSetRecoilState } from "recoil";
import allCustomerAtom, {
  viewCustomerAtom,
  viewCustomerIDAtom,
  viewCustomerType,
} from "@/store/Customer";
import PhoneNumberInput from "@/components/Inputs/PhoneInput/PhoneNumberInput";
import React from "react";
import AddressInput from "@/components/Inputs/AddressInput/AddressInput";
import { addressType } from "@type/api/miscellaneous";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseBalanceToFloat } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { editCustomerType, settleBalanceType } from "@type/api/customer";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/Spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import ProfileUrlInput from "@/components/Inputs/PhoneInput/ProfileUrlInput";

const EditCustomer = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const [viewCustomer, setViewCustomer] = useRecoilState(viewCustomerAtom);
  const setViewCustomerID = useSetRecoilState(viewCustomerIDAtom);
  const setAllCustomers = useSetRecoilState(allCustomerAtom);

  const EditItemForm = () => {
    const form = useForm<z.infer<typeof editCustomerType>>({
      resolver: zodResolver(editCustomerType),
      reValidateMode: "onChange",
      defaultValues: {
        customer_id: viewCustomer?.id,
        name: viewCustomer?.name,
        profileUrl: viewCustomer?.profileUrl ?? undefined,
      },
    });

    async function onSubmit(values: z.infer<typeof editCustomerType>) {
      const res = await request.put("/customer/editCustomer", values);
      if (res.status == 200) setOpen(false);
      setViewCustomerID(null);
      setViewCustomer(null);
      setAllCustomers([]);
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex w-full flex-row justify-around">
            <FormField
              control={form.control}
              name="profileUrl"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center">
                  <FormLabel>Profile Url</FormLabel>
                  <FormControl>
                    <ProfileUrlInput
                      value={field.value}
                      removePhoto={() => {
                        form.setValue("profileUrl", "");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting && <Spinner />}
            {!form.formState.isSubmitting && "Edit Customer"}
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {viewCustomer && <EditItemForm />}
        {!viewCustomer && (
          <div className="w-full h-40 flex items-center justify-center">
            Unable to find customer to edit!!!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomer;