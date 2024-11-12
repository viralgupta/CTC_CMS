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
import { createDriverType } from "@type/api/driver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "@/components/ui/Spinner";
import { z } from "zod";
import request from "@/lib/request";
import { SelectDriverSizeOfVehicle } from "@/components/Inputs/SelectDriverSizeOfVehicle";

const CreateDriverForm = () => {

  const form = useForm<z.infer<typeof createDriverType>>({
    resolver: zodResolver(createDriverType),
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      profileUrl: "",
      phone_numbers: [],
    },
  });

  const OnProfileURLChange = (url: string) => {
    if (url) {
      form.setValue("profileUrl", url);
    }
  };

  const AddPhoneNumber = (
    data: z.infer<typeof createDriverType>["phone_numbers"][number]
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

  async function onSubmit(values: z.infer<typeof createDriverType>) {
    try {
      const res = await request.post("/driver/createDriver", values);
      if (res.status == 200) {
        form.reset();
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <FormLabel>Driver Name</FormLabel>
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
            name="size_of_vehicle"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Vehicle Type</FormLabel>
                <FormControl>
                  <SelectDriverSizeOfVehicle onChange={field.onChange} value={field.value}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vehicle_number"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Vehicle Number</FormLabel>
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
                <FormLabel>Driver Phone Number</FormLabel>
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

const CreateDriver = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="4xl">
        <DialogHeader>
          <DialogTitle>Create a new Driver</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <CreateDriverForm />
      </DialogContent>
    </Dialog>
  );
};

export default CreateDriver;