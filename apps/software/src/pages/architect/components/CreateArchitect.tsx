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
import PhoneNumberInput from "@/components/Inputs/PhoneInput/PhoneNumberInput";
import ProfileUrlInput from "@/components/Inputs/PhoneInput/ProfileUrlInput";
import { createArchitectType } from "@type/api/architect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "@/components/ui/Spinner";
import { z } from "zod";
import request from "@/lib/request";

const CreateArchitectForm = () => {
  const form = useForm<z.infer<typeof createArchitectType>>({
    resolver: zodResolver(createArchitectType),
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      balance: "",
      profileUrl: "",
      area: "",
      phone_numbers: [],
    },
  });

  const OnProfileURLChange = (url: string) => {
    if (url) {
      form.setValue("profileUrl", url);
    }
  };

  const AddPhoneNumber = (
    data: z.infer<typeof createArchitectType>["phone_numbers"][number]
  ) => {
    let oldPhoneNumberArray = form.getValues("phone_numbers") ?? [];

    const samePhoneNumber = oldPhoneNumberArray.filter(
      (od) => od.phone_number == data.phone_number
    );
    if (samePhoneNumber.length > 0) return;

    if (data.isPrimary) {
      oldPhoneNumberArray = oldPhoneNumberArray.map((phone) => ({
        ...phone,
        isPrimary: false,
      }));
    } else if (oldPhoneNumberArray.length == 0) {
      data.isPrimary = true;
    }

    oldPhoneNumberArray.push(data);

    form.setValue("phone_numbers", oldPhoneNumberArray);
    form.trigger("phone_numbers");
  };

  const removePhoneNumber = (phone_no: string) => {
    let oldPhoneNumberArray = form.getValues("phone_numbers");

    const oldPhoneNumber = oldPhoneNumberArray.find(
      (phone) => phone.phone_number == phone_no
    );
    const newPhoneNumberArray = oldPhoneNumberArray.filter(
      (phone) => phone.phone_number !== phone_no
    );

    if (oldPhoneNumber?.isPrimary && newPhoneNumberArray.length > 0) {
      newPhoneNumberArray[0].isPrimary = true;
    }

    form.setValue("phone_numbers", newPhoneNumberArray);
    form.trigger("phone_numbers");
  };

  async function onSubmit(values: z.infer<typeof createArchitectType>) {
    try {
      const res = await request.post("/architect/createArchitect", values);
      if (res.status == 200) {
        form.reset();
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="profileUrl"
            render={({ field }) => (
              <FormItem className="pr-2">
                <FormLabel>&nbsp;</FormLabel>
                <FormControl>
                  <ProfileUrlInput
                    value={field.value}
                    removePhoto={() => {
                      form.setValue("profileUrl", undefined);
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
              <FormItem className="w-full">
                <FormLabel>Architect Name</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Architect Existing Balance</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Architect Area</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
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
                <FormLabel>Architect Phone Number</FormLabel>
                <FormControl>
                  <PhoneNumberInput
                    OnProfileURLChange={OnProfileURLChange}
                    AddNumber={AddPhoneNumber}
                    removeNumber={removePhoneNumber}
                    value={field.value}
                  />
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

const CreateArchitect = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Create a new Architect</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <CreateArchitectForm />
      </DialogContent>
    </Dialog>
  );
};

export default CreateArchitect;
