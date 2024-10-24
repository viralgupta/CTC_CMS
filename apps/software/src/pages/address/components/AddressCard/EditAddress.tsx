import AddressAreaInput from "@/components/Inputs/AddressInput/AddressAreaInput";
import CordinatesInput from "@/components/Inputs/AddressInput/CordinatesInput";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/Spinner";
import { useAddressAreas } from "@/hooks/addressArea";
import request from "@/lib/request";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { addressType as originalAddressType } from "@type/api/miscellaneous";
import React from 'react'
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSetRecoilState } from "recoil";
import { viewAddressAtom, viewAddressIdAtom } from "@/store/address";

const addressType = originalAddressType.extend({
  address_id: z.string(),
  customer_id: z.string()
})

type EditAddressProps = {
  children: React.ReactNode
  address: z.infer<typeof addressType>;
}

const EditAddress = ({ address, children }: EditAddressProps) => {
  const { addressAreas } = useAddressAreas();
  const setViewAddressId = useSetRecoilState(viewAddressIdAtom);
  const setViewAddress = useSetRecoilState(viewAddressAtom);

  const form = useForm<z.infer<typeof addressType>>({
    resolver: zodResolver(addressType),
    reValidateMode: "onChange",
    defaultValues: address
  });

  async function onSubmit(values: z.infer<typeof addressType>) {
    await request.put("/customer/editAddress", values);
    form.reset();
    setViewAddress(null);
    setViewAddressId(null);
    return;
  }

  return (
    <Dialog>
    <DialogTrigger className="w-full" asChild>
      {children}
    </DialogTrigger>
    <DialogContent size="2xl">
      <DialogHeader>
        <DialogTitle>Edit Address</DialogTitle>
        <DialogDescription className="hidden"></DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
            <FormField
              control={form.control}
              name="house_number"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>House Number</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address_area_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Address Area</FormLabel>
                  <FormControl>
                    <AddressAreaInput
                      onChange={field.onChange}
                      value={field.value}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Address</FormLabel>
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
              name="city"
              render={({ field }) => (
                <FormItem className="w-2/5">
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="w-2/5">
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPrimary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-end space-x-3 space-y-0 mt-4 md:mt-0 md:mb-4 rounded-md md:mx-auto">
                  <FormLabel>Is&nbsp;Primary</FormLabel>
                  <FormControl>
                    <Checkbox
                      className=""
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full flex-col justify-between gap-2 md:flex-row md:items-end">
            <FormField
              control={form.control}
              name="cordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                      <CordinatesInput
                        disabled={
                          form.getValues("address") == "" ||
                          form.getValues("address_area_id") == "" ||
                          form.getValues("city") == ""
                        }
                        onCordinateSelect={field.onChange}
                        values={field.value}
                        getAddress={() => {
                          return (
                            form
                              .getValues(["house_number", "address"])
                              .filter((val) => val !== "")
                              .join(", ") +
                            (addressAreas.length > 0 ? `, ${addressAreas.find((area) => area.id == form.getValues("address_area_id"))?.area ?? ""}` : "") +
                            (form.getValues("city")
                              ? `, ${form.getValues("city")}`
                              : "")
                          );
                        }}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting}
              type="button"
              className="ml-auto"
              onClick={() => form.handleSubmit(onSubmit)()}
            >
              {form.formState.isSubmitting && <Spinner />}
              {!form.formState.isSubmitting && "Edit Address"}
            </Button>
          </div>
        </form>
      </Form>
      </DialogContent>
      </Dialog>
  )
}

export default EditAddress