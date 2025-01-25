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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Spinner from "@/components/ui/Spinner";
import { useAllOrders } from "@/hooks/orders";
import request from "@/lib/request";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrderMovementType } from "@type/api/order";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  viewOrderAtom,
  viewOrderIdAtom,
  viewOrderMovementIdAtom,
} from "@/store/order";
import { useRecoilState, useSetRecoilState } from "recoil";
import React from "react";
import SearchDriver from "@/pages/driver/components/SearchDriver";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import SelectOrderItems from "./Input/SelectOrderItems";
import { Checkbox } from "@/components/ui/checkbox";

const CreateOrderMovement = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="w-full mb-2 text-xl font-cubano">
          Create New Movement
        </Button>
      </DialogTrigger>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Create A New Movement</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <CreateOrderMovementForm/>
      </DialogContent>
    </Dialog>
  );
};

const CreateOrderMovementForm = () => {
  const { refetchOrders } = useAllOrders();
  const [viewOrder, setViewOrder] = useRecoilState(viewOrderAtom);
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);
  const setViewOrderMovementId = useSetRecoilState(viewOrderMovementIdAtom);

  const form = useForm<z.infer<typeof createOrderMovementType>>({
    resolver: zodResolver(createOrderMovementType),
    reValidateMode: "onChange",
    defaultValues: {
      order_id: viewOrder?.id,
      labour_frate_cost: 0,
      // @ts-expect-error
      created_at: new Date().toISOString(),
    },
  });

  async function onSubmit(values: z.infer<typeof createOrderMovementType>) {
    let setError = false;
    (order_movement_items ?? []).forEach((omi) => {
      const totalWarehouseQuantity = omi.warehouse_quantities.reduce((acc, wq) => acc + wq.quantity, 0);
      if(totalWarehouseQuantity !== omi.quantity){
        setError = true;
      }
    });
    if(setError){
      form.setError("order_movement_items", {
        message: "Warehouse quantity must be equal to the quantity of the order item"
      });
      return;
    }
    try {
      const res = await request.post("/order/createMovement", values);
      if (res.status == 200) {
        form.reset();
        refetchOrders();
        setViewOrder(null);
        setViewOrderId(null);
        setViewOrderMovementId(null);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const [type, delivered, delivery_at, order_movement_items] = form.watch(["type", "delivered", "delivery_at", "order_movement_items"]);

  React.useEffect(() => {
    if (type == "RETURN") {
      form.setValue("delivered", true);
    } else {
      form.resetField("delivery_at");
    }
  }, [type]);

  React.useEffect(() => {
    let setError = false;
    (order_movement_items ?? []).forEach((omi) => {
      const totalWarehouseQuantity = (omi.warehouse_quantities ?? []).reduce((acc, wq) => acc + wq.quantity, 0);
      if(totalWarehouseQuantity !== omi.quantity){
        setError = true;
      }
    });
    if(setError){
      form.setError("order_movement_items", {
        message: "Warehouse quantity must be equal to the quantity of the order item"
      });
    } else {
      form.clearErrors("order_movement_items");
      form.trigger("order_movement_items");
    }
  }, [order_movement_items]);

  React.useEffect(() => {
    if (delivered && !delivery_at) {
      // @ts-expect-error
      form.setValue("delivery_at", new Date().toISOString());
    }
  }, [delivered]);

  return (
    <div className="w-full h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2"
        >
          <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Order Movement Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="TYPE" />
                      </SelectTrigger>
                      <SelectContent>
                        {viewOrder?.status == "Pending" && (
                          <SelectItem value="DELIVERY">DELIVERY</SelectItem>
                        )}
                        <SelectItem value="RETURN">RETURN</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delivered"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Order Movement Delivered</FormLabel>
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
          <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
            <FormField
              control={form.control}
              name="driver_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Driver</FormLabel>
                  <FormControl>
                    <SearchDriver
                      onChange={field.onChange}
                      value={field.value}
                      className="w-full h-10 rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="labour_frate_cost"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Labour and Frate Cost</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : 0
                        )
                      }
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
              name="created_at"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Created At</FormLabel>
                  <FormControl>
                    <DatePicker onChange={field.onChange} value={field.value}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delivery_at"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{form.getValues("type") == "DELIVERY" ? "Delivered At" : "Returned At"}</FormLabel>
                  <FormControl>
                    <DatePicker disabled={form.getValues("delivered") == false} onChange={field.onChange} value={field.value}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="order_movement_items"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Order items</FormLabel>
                <FormControl>
                  <SelectOrderItems delivered={true} onChange={field.onChange} value={field.value}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            {form.formState.isSubmitting && <Spinner />}
            {!form.formState.isSubmitting && "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateOrderMovement;
