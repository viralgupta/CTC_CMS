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
import { useSetRecoilState } from "recoil";
import { useAllItems } from "@/hooks/items";

const RecieveItemOrder = ({
  children,
  itemOrder,
}: {
  children: React.ReactNode;
  itemOrder: viewItemType["item_orders"][number];
}) => {
  const [open, setOpen] = React.useState(false);
  const setViewItem = useSetRecoilState(viewItemAtom);
  const setViewItemId = useSetRecoilState(viewItemIDAtom);
  const { refetchItems } = useAllItems()

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
    const res = await request.put("/inventory/receiveItemOrder", values);
    if (res.status == 200) {
      setOpen(false);
      setViewItem(null);
      setViewItemId(null);
      refetchItems();
    }
  }

  const received_quantity = form.watch("received_quantity");

  React.useEffect(() => {
    if(!form.getValues("receive_date") && received_quantity) {
      // @ts-expect-error
      form.setValue('receive_date', new Date().toISOString());
    }
  }, [received_quantity])

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
