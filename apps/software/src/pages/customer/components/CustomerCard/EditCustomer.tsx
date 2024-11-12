import { Button } from "@/components/ui/button";
import request from "@/lib/request";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  viewCustomerAtom,
  viewCustomerIDAtom,
} from "@/store/customer";
import React from "react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { editCustomerType } from "@type/api/customer";
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