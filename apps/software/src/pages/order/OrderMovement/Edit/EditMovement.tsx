import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { editOrderMovementType } from "@type/api/order";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { viewMovementType } from "../OrderMovement";
import SearchDriver from "@/pages/driver/components/SearchDriver";
import request from "@/lib/request";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/Spinner";
import { DatePicker } from "@/components/ui/date-picker";
import { useSetRecoilState } from "recoil";
import { viewOrderAtom, viewOrderIdAtom, viewOrderMovementIdAtom } from "@/store/order";

const EditMovement = ({
  children,
  orderMovement,
}: {
  children: React.ReactNode;
  orderMovement: viewMovementType;
}) => {
  const setViewOrderMovementId = useSetRecoilState(viewOrderMovementIdAtom);
  const setViewOrder = useSetRecoilState(viewOrderAtom);
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);

  const form = useForm<z.infer<typeof editOrderMovementType>>({
    resolver: zodResolver(editOrderMovementType),
    reValidateMode: "onChange",
    defaultValues: {
      id: orderMovement.id,
      created_at: orderMovement.created_at,
      delivery_at: orderMovement.delivery_at ?? undefined,
      driver_id: orderMovement.driver_id ?? undefined,
      labour_frate_cost: orderMovement.labour_frate_cost,
    },
  });

  async function onSubmit(values: z.infer<typeof editOrderMovementType>) {
    try {
      const res = await request.put("/order/editMovement", values);
      if (res.status == 200) {
        form.reset();
        setViewOrderMovementId(null);
        setViewOrderId(null);
        setViewOrder(null);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Edit Order Movement!</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
              <FormField
                control={form.control}
                name="driver_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Driver</FormLabel>
                    <FormControl>
                      <SearchDriver
                        value={field.value}
                        onChange={field.onChange}
                        className="rounded-lg"
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
                    <FormLabel>Labour And Frate Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row pb-2">
              <FormField
                control={form.control}
                name="created_at"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Created At</FormLabel>
                    <FormControl>
                      <DatePicker
                        className="w-full"
                        value={field.value}
                        onChange={field.onChange}
                      />
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
                    <FormLabel>Delivered At</FormLabel>
                    <FormControl>
                      <DatePicker
                        className="w-full"
                        disabled={orderMovement.status == "Pending"}
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
              {!form.formState.isSubmitting && "Edit Order Movement"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMovement;
