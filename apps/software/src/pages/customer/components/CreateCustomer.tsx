import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PhoneNumberInput from "@/components/customer/PhoneNumberInput";
import { createCustomerType } from "../../../../../../packages/types/api/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "@/components/ui/Spinner";
import request from "@/utils/request";
import { z } from "zod";

const CreateCustomerForm = () => {
  
  const form = useForm<z.infer<typeof createCustomerType>>({
    resolver: zodResolver(createCustomerType),
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      balance: "",
      phone_numbers: []
    },
  });

  const OnProfileURLChange = (url: string) => {
    if(url) {
      form.setValue("profileUrl", url)
    }
  }

  const OnPhoneDataChange = (data: z.infer<typeof createCustomerType>["phone_numbers"][number]) => {
    let oldPhoneNumberArray = form.getValues("phone_numbers") ?? [];
    
    const samePhoneNumber = oldPhoneNumberArray.filter((od) => od.phone_number == data.phone_number);
    if(samePhoneNumber.length > 0) return;

    if(data.isPrimary){
      oldPhoneNumberArray = oldPhoneNumberArray.map((phone) => ({
        ...phone,
        isPrimary: false,
      }));
    }

    oldPhoneNumberArray.push(data);
    
    form.setValue("phone_numbers", oldPhoneNumberArray);
    form.trigger("phone_numbers");
  }

  const removePhoneNumber = (phone_no: string) => {
    let oldPhoneNumberArray = form.getValues("phone_numbers");

    const newPhoneNumberArray = oldPhoneNumberArray.filter((phone) => phone.phone_number !== phone_no);

    form.setValue("phone_numbers", newPhoneNumberArray);
    form.trigger("phone_numbers");
  }

  async function onSubmit(values: z.infer<typeof createCustomerType>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Customer Existing Balance</FormLabel>
                <FormControl>
                <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="phone_numbers"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Customer Phone Number</FormLabel>
                <FormControl>
                  <PhoneNumberInput OnProfileURLChange={OnProfileURLChange} onChange={OnPhoneDataChange} removeNumber={removePhoneNumber} value={field.value}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting && <Spinner />}
          {!form.formState.isSubmitting && "Submit"}
        </Button>
      </form>
    </Form>
  );
};

const CreateCustomer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="4xl">
        <DialogHeader>
          <DialogTitle>Create a new customer</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <CreateCustomerForm />
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomer;
