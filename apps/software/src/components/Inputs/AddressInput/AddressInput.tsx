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
import { Input } from "../../ui/input";
import { useForm } from "react-hook-form";
import { addressType } from "@type/api/miscellaneous";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../ui/button";
import Spinner from "../../ui/Spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Eye, Trash2 } from "lucide-react";
import AddressAreaInput from "./AddressAreaInput";
import CordinatesInput from "./CordinatesInput";
import { useAddressAreas } from "@/hooks/addressArea";

const addressTypeWithOptionals = addressType.extend({
  id: z.string().optional(),
  address_area: z.string().optional()
})

const AddressArrayWithOptionals = z.array(addressTypeWithOptionals);

type AddressInputProps = {
  AddAddress: (data: z.infer<typeof addressTypeWithOptionals>) => void;
  removeAddress?: (value: string) => void;
  viewAddress?: (id: string) => void;
  values: z.infer<typeof AddressArrayWithOptionals>;
  children?: React.ReactNode
};

const AddressInput = ({
  AddAddress,
  viewAddress,
  removeAddress,
  values,
  children
}: AddressInputProps) => {
  const { addressAreas } = useAddressAreas();

  const form = useForm<z.infer<typeof addressTypeWithOptionals>>({
    resolver: zodResolver(addressTypeWithOptionals),
    reValidateMode: "onChange",
    defaultValues: {
      house_number: "",
      address: "",
      city: "Ghaziabad",
      state: "Uttar Pradesh",
      isPrimary: values.length > 0 ? false : true,
    },
  });

  async function onSubmit(values: z.infer<typeof addressTypeWithOptionals>) {
    await AddAddress(values);
    form.reset();
    return;
  }

  return (
    <Dialog>
      <DialogTrigger className="w-full" asChild={children ? true : false}>
        {children ? children : <Input
          placeholder={
            values.length > 0
              ? `${values.find((v) => v.isPrimary == true)?.house_number ?? ""}, ${values.find((v) => v.isPrimary == true)?.address ?? ""}`
              : "Enter Address..."
          }
        />}
      </DialogTrigger>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Add Address</DialogTitle>
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
                {!form.formState.isSubmitting && "Submit"}
              </Button>
            </div>
          </form>
        </Form>
        <Table>
          <TableCaption>
            {values.length == 0
              ? "No Addresses Added!"
              : "A list of added addresses."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-min text-center">House No.</TableHead>
              <TableHead className="w-min text-center">Address</TableHead>
              <TableHead className="w-min text-center">Address Area</TableHead>
              <TableHead className="w-min text-center">City</TableHead>
              <TableHead className="w-min text-center">Primary</TableHead>
              <TableHead className="w-min text-center">{viewAddress ? "View" : "Remove"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!!values &&
              values.map((v, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-center">
                      {v.house_number}
                    </TableCell>
                    <TableCell className="text-center">{v.address}</TableCell>
                    <TableCell className="text-center">
                      {v.address_area
                        ? v.address_area
                        : addressAreas.length > 0
                          ? (addressAreas.find(
                              (area) => area.id == v.address_area_id
                            )?.area ?? "")
                          : ""}
                    </TableCell>
                    <TableCell className="text-center">{v.city}</TableCell>
                    <TableCell>
                      {v.isPrimary ? (
                        <Check className="mx-auto stroke-primary" />
                      ) : (
                        <X className="mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <Button
                        size={"icon"}
                        onClick={() => {
                          if (viewAddress) {
                            viewAddress(v.id ?? "");
                          } else if (removeAddress) {
                            removeAddress(v.address);
                          }
                        }}
                      >
                        {viewAddress && <Eye/>}
                        {removeAddress && <Trash2 />}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default AddressInput;
