import { Button } from "@/components/ui/button";
import request from "@/lib/request";
import { useRecoilState, useSetRecoilState } from "recoil";
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
import { viewDriverAtom, viewDriverIdAtom } from "@/store/driver";
import { useAllDrivers } from "@/hooks/driver";
import { editDriverType } from "@type/api/driver";
import { SelectDriverSizeOfVehicle } from "@/components/Inputs/SelectDriverSizeOfVehicle";

const EditDriver = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const [viewDriver, setViewDriver] = useRecoilState(viewDriverAtom);
  const setViewDriverID = useSetRecoilState(viewDriverIdAtom);
  const { refetchDrivers } = useAllDrivers();

  const EditDriverForm = () => {
    const form = useForm<z.infer<typeof editDriverType>>({
      resolver: zodResolver(editDriverType),
      reValidateMode: "onChange",
      defaultValues: {
        driver_id: viewDriver?.id,
        name: viewDriver?.name,
        profileUrl: viewDriver?.profileUrl ?? undefined,
        size_of_vehicle: viewDriver?.size_of_vehicle,
        vehicle_number: viewDriver?.vehicle_number ?? undefined
      },
    });

    async function onSubmit(values: z.infer<typeof editDriverType>) {
      const res = await request.put("/driver/editDriver", values);
      if (res.status == 200) setOpen(false);
      setViewDriverID(null);
      setViewDriver(null);
      refetchDrivers();
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex w-full flex-row justify-around">
            <FormField
              control={form.control}
              name="profileUrl"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center mr-2 w-1/6">
                  <FormLabel>Profile</FormLabel>
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
          <div className="flex w-full flex-row justify-around">
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
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting && <Spinner />}
            {!form.formState.isSubmitting && "Edit Driver"}
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
          <DialogTitle>Edit Driver</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {viewDriver && <EditDriverForm />}
        {!viewDriver && (
          <div className="w-full h-40 flex items-center justify-center">
            Unable to find driver to edit!!!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditDriver;