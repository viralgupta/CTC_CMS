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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/Spinner";
import { useAllOrders } from "@/hooks/orders";
import request from "@/lib/request";
import SearchCustomer from "@/pages/customer/components/SearchCustomer";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrderType } from "@type/api/order";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SelectPriority, SelectStatus } from "./SelectFilter";
import { allOrdersType } from "@/store/order";
import { DatePicker } from "@/components/ui/date-picker";
import SearchAddressInput from "./Input/SearchAddressInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SelectOrderItems from "./Input/SelectOrderItems/SelectOrderItems";
import { useAllItems } from "@/hooks/items";
import React from "react";
import SearchArchitect from "@/pages/architect/components/SearchArchitect";
import SearchCarpenter from "@/pages/carpenter/components/SearchCarpenter";

const CreateOrder = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="w-full mb-4 text-xl font-cubano">
          Create New Order
        </Button>
      </DialogTrigger>
      <DialogContent size="7xl">
        <DialogHeader>
          <DialogTitle>Create A New Order</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <CreateOrderForm />
      </DialogContent>
    </Dialog>
  );
};

const CreateOrderForm = () => {
  const { refetchOrders } = useAllOrders();
  const { items: allItems } = useAllItems();

  const form = useForm<z.infer<typeof createOrderType>>({
    resolver: zodResolver(createOrderType),
    reValidateMode: "onChange",
    defaultValues: {
      priority: "Low",
      status: "Pending",
      order_items: [],
    },
  });

  async function onSubmit(values: z.infer<typeof createOrderType>) {
    try {
      const res = await request.post("/order/createOrder", values);
      if (res.status == 200) {
        form.reset();
        refetchOrders();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const [total_order_value, setTotal_order_value] = React.useState(0);
  const [final_amount, setFinal_amount] = React.useState(0);
  const [remaining_amount, setRemaining_amount] = React.useState(0);

  const [order_items, lfc, discount, amount_paid, customer_id] = form.watch(["order_items", "labour_frate_cost", "discount", "amount_paid", "customer_id"]);


  React.useEffect(() => {
    setTotal_order_value(order_items.reduce((pre, current) => {
      return pre + parseFloat(current.total_value ?? "0.00");
    }, 0))
  }, [order_items]);

  React.useEffect(() => {
    setFinal_amount(total_order_value + (lfc ? lfc : 0) - parseFloat(discount ? discount : "0.00"));
  }, [total_order_value, lfc, discount]);

  React.useEffect(() => {
    setRemaining_amount(final_amount - parseFloat(amount_paid ? amount_paid : "0.00"));
  }, [final_amount, amount_paid])

  return (
    <div className="w-full h-full flex space-x-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 w-1/2"
        >
          <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <SearchCustomer
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
              name="driver_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Driver</FormLabel>
                  <FormControl>
                    <SearchCustomer
                      value={field.value}
                      onChange={field.onChange}
                      className="rounded-lg"
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
              name="carpanter_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Carpenter</FormLabel>
                  <FormControl>
                    <SearchCarpenter
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
              name="driver_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Architect</FormLabel>
                  <FormControl>
                    <SearchArchitect
                      value={field.value}
                      onChange={field.onChange}
                      className="rounded-lg"
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
              name="delivery_address_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <SearchAddressInput
                      filterCustomerId={customer_id}
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
              name="delivery_date"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Delivery Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
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
              name="priority"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Order Priority</FormLabel>
                  <FormControl>
                    <SelectPriority
                      value={
                        field.value == "High" ||
                        field.value == "Medium" ||
                        field.value == "Low"
                          ? `Priority-${field.value}`
                          : ""
                      }
                      onChange={(val: keyof allOrdersType) => {
                        field.onChange(val.replace("Priority-", ""));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Delivery Status</FormLabel>
                  <FormControl>
                    <SelectStatus
                      value={
                        field.value == "Pending" || field.value == "Delivered"
                          ? `Status-${field.value}`
                          : ""
                      }
                      onChange={(val: keyof allOrdersType) => {
                        field.onChange(val.replace("Status-", ""));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="order_items"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Order Items</FormLabel>
                <FormControl>
                  <SelectOrderItems
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
              name="labour_frate_cost"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Labour And Frate Cost</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
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
              name="discount"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Discount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value).toString() : ""
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
              name="amount_paid"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Amount Paid</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value).toString() : ""
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full flex-col justify-between gap-2 md:flex-row items-end">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Order Note</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="resize-none overflow-y-scroll hide-scroll"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
              className="h-20"
            >
              {form.formState.isSubmitting && <Spinner />}
              {!form.formState.isSubmitting && "Submit"}
            </Button>
          </div>
        </form>
      </Form>
      <div className="w-1/2 h-full rounded-md border p-4">
        <span className="text-2xl font-cubano">Order Summary</span>
        <div className="w-full h-3/5 mb-1 overflow-y-auto bg-gradient-to-t from-accent mt-2 rounded-sm hide-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center p-0 h-8">Item Name</TableHead>
                <TableHead className="text-center p-0 h-8">Quantity</TableHead>
                <TableHead className="text-center p-0 h-8">Rate</TableHead>
                <TableHead className="text-center p-0 h-8">
                  Total Value
                </TableHead>
                <TableHead className="text-center p-0 h-8">
                  Arch. C.
                </TableHead>
                <TableHead className="text-center p-0 h-8">
                  Carp. C.
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="h-1/2 overflow-scroll">
              {form.getValues("order_items").map((item) => {
                const foundItem = allItems.find((i) => i.id === item.item_id);
                return (
                  <TableRow key={item.item_id} className="leading-3 p-0">
                    <TableCell className="text-center p-0 py-2">
                      {foundItem?.name ?? ""}
                    </TableCell>
                    <TableCell className="text-center p-0 py-2">{item.quantity}</TableCell>
                    <TableCell className="text-center p-0 py-2">{`${item.rate} Per ${foundItem?.rate_dimension ?? ""}`}</TableCell>
                    <TableCell className="text-center p-0 py-2">
                      {item.total_value}
                    </TableCell>
                    <TableCell className="text-center p-0 py-2">
                      {item.architect_commision}
                    </TableCell>
                    <TableCell className="text-center p-0 py-2">
                      {item.carpanter_commision}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <Card className="w-full h-48">
          <CardContent className="p-2 py-1">
            <div className="w-full text-2xl font-mono flex justify-between">
              Total Order Value
              <span>{total_order_value.toFixed(2)}</span>
            </div>
            <div className="w-full text-lg font-mono flex justify-between text-foreground/60">
              + Labour And Frate
              <span>{lfc ? lfc.toFixed(2) : "0.00"}</span>
            </div>
            <div className="w-full text-lg font-mono flex justify-between text-foreground/60">
              - Discount
              <span>
                {discount ? parseFloat(discount).toFixed(2) : "0.00"}
              </span>
            </div>
            <Separator />
            <div className="w-full text-2xl font-mono flex justify-between">
              Final Order Value
              <span>{final_amount.toFixed(2)}</span>
            </div>
            <div className="w-full text-lg font-mono flex justify-between text-foreground/60">
              - Amount Paid
              <span>
                {amount_paid ? parseFloat(amount_paid).toFixed(2) : "0.00"}
              </span>
            </div>
            <Separator />
            <div className="w-full text-2xl font-mono flex justify-between text-primary">
              Remaining Amount
              <span>{remaining_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateOrder;
