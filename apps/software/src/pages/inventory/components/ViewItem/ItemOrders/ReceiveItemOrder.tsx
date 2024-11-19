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
import { receiveItemOrderType } from "@type/api/item";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { useRecoilState, useSetRecoilState } from "recoil";
import CreditWarehouseQuantity from "../../inputs/CreditWarehouseQuantity";

const RecieveItemOrder = ({
  children,
  itemOrder,
}: {
  children: React.ReactNode;
  itemOrder: viewItemType["item_orders"][number];
}) => {
  const [open, setOpen] = React.useState(false);
  const [viewItem, setViewItem] = useRecoilState(viewItemAtom);
  const setViewItemId = useSetRecoilState(viewItemIDAtom);

  const form = useForm<z.infer<typeof receiveItemOrderType>>({
    resolver: zodResolver(receiveItemOrderType),
    reValidateMode: "onChange",
    defaultValues: {
      id: itemOrder.id,
      received_quantity: itemOrder.received_quantity ?? 0,
      // @ts-expect-error
      receive_date: itemOrder.receive_date ? typeof(itemOrder.receive_date) == "string" ? itemOrder.receive_date : itemOrder.receive_date.toISOString() : undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof receiveItemOrderType>) {
    const total_quantity = (warehouse_quantities ?? []).reduce((acc, curr) => acc + curr.quantity, 0);
    if(total_quantity !== received_quantity) {
      form.setError("warehouse_quantities", {
        type: "custom",
        message: "Received quantity must be equal to the total quantity in the warehouse."
      });
      return;
    }
    const res = await request.put("/inventory/receiveItemOrder", values);
    if (res.status == 200) {
      setOpen(false);
      setViewItem(null);
      setViewItemId(null);
    }
  }

  const [received_quantity, warehouse_quantities] = form.watch(["received_quantity", "warehouse_quantities"]);

  React.useEffect(() => {
    if(!form.getValues("receive_date") && received_quantity) {
      // @ts-expect-error
      form.setValue('receive_date', new Date().toISOString());
    }
  }, [received_quantity])

  React.useEffect(() => {
    if((received_quantity ?? 0) > 0){
      const total_quantity = (warehouse_quantities ?? []).reduce((acc, curr) => acc + curr.quantity, 0);
      if(total_quantity !== received_quantity) {
        form.setError("warehouse_quantities", {
          type: "custom",
          message: "Received quantity must be equal to the total quantity in the warehouse."
        })
      } else {
        form.clearErrors("warehouse_quantities");
      }
    } else {
      form.clearErrors("warehouse_quantities");
      
    }
  }, [received_quantity, warehouse_quantities])

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive Item Order</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
              <FormField
                control={form.control}
                name="received_quantity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Received Quantity</FormLabel>
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
                name="receive_date"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Received Date</FormLabel>
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
            <div className="flex w-full flex-col justify-between md:flex-row">
                <FormField
                  control={form.control}
                  name="warehouse_quantities"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Warehouse Quantities</FormLabel>
                      <FormControl>
                        <CreditWarehouseQuantity
                          totalQuantity={form.getValues("received_quantity") ?? 0}
                          currentQuantity={viewItem?.warehouse_quantities ?? []}
                          disabled={form.getValues("received_quantity") == 0}
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
              {!form.formState.isSubmitting && "Receive Quantity"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RecieveItemOrder;
