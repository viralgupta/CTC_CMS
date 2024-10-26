import React from "react";
import request from "@/lib/request";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { viewItemAtom, viewItemIDAtom, viewItemType } from "@/store/Items";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { editItemOrderType } from "@type/api/item";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { useSetRecoilState } from "recoil";

const EditItemOrder = ({
  children,
  itemOrder,
}: {
  children: React.ReactNode;
  itemOrder: viewItemType["item_orders"][number];
}) => {
  const [open, setOpen] = React.useState(false);
  const setViewItem = useSetRecoilState(viewItemAtom);
  const setViewItemId = useSetRecoilState(viewItemIDAtom);

  const form = useForm<z.infer<typeof editItemOrderType>>({
    resolver: zodResolver(editItemOrderType),
    reValidateMode: "onChange",
    defaultValues: {
      id: itemOrder.id,
      vendor_name: itemOrder.vendor_name ?? "",
      ordered_quantity: itemOrder.ordered_quantity ?? 0,
      // @ts-expect-error
      order_date: itemOrder.order_date ? typeof(itemOrder.order_date) == "string" ? itemOrder.order_date : itemOrder.order_date.toISOString() : undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof editItemOrderType>) {
    const res = await request.put("/inventory/editItemOrder", values);
    if (res.status == 200) {
      setOpen(false);
      setViewItem(null);
      setViewItemId(null);
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item Order</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="vendor_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
              <FormField
                control={form.control}
                name="ordered_quantity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Ordered Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : ""
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order_date"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Order Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting && <Spinner />}
              {!form.formState.isSubmitting && "Edit Item Order"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemOrder;
