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
import { allOrdersType, showCommissionAtom } from "@/store/order";
import { DatePicker } from "@/components/ui/date-picker";
import SearchAddressInput from "./Input/SearchAddressInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SelectOrderItems from "./Input/SelectOrderItems/SelectOrderItems";
import { useAllItems } from "@/hooks/items";
import React from "react";
import SearchArchitect from "@/pages/architect/components/SearchArchitect";
import SearchCarpenter from "@/pages/carpenter/components/SearchCarpenter";
import { ShowCommissionButton } from "./Input/SelectOrderItems/SelectedItemTable";
import { useRecoilValue } from "recoil";
import { selectedItemRateWithCommissionType } from "@/store/Items";
import { calculateTotalCommission } from "./Input/SelectOrderItems/AddNewItem";

const CreateOrder = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="w-full mb-4 text-xl font-cubano flex-none">
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
  
  const [total_order_value, setTotal_order_value] = React.useState(0);
  const [final_amount, setFinal_amount] = React.useState(0);
  const [remaining_amount, setRemaining_amount] = React.useState(0);
  const showCommission = useRecoilValue(showCommissionAtom);
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

  const [
    order_items,
    discount,
    amount_paid,
    customer_id,
    status,
    carpenter_id,
    architect_id,
  ] = form.watch([
    "order_items",
    "discount",
    "amount_paid",
    "customer_id",
    "status",
    "carpenter_id",
    "architect_id",
  ]);

  async function onSubmit(values: z.infer<typeof createOrderType>) {
    order_items.forEach(oi => {
      const totalOrderItemWarehouseQuantity = (oi.warehouse_quantities ?? []).reduce((pre, current) => {
        return pre + current.quantity;
      }, 0);
      if(!oi.warehouse_quantities || totalOrderItemWarehouseQuantity !== oi.quantity) {
        form.setError("order_items", {
          message: "Please select warehouse quantities for all order items!"
        });
        return;
      }
    })
    if(!form.formState.isValid) return;
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

  React.useEffect(() => {
    setTotal_order_value(order_items.reduce((pre, current) => {
      return pre + parseFloat(current.total_value ?? "0.00");
    }, 0))
  }, [order_items]);

  React.useEffect(() => {
    setFinal_amount(total_order_value - parseFloat(discount ? discount : "0.00"));
  }, [total_order_value, discount]);

  React.useEffect(() => {
    setRemaining_amount(final_amount - parseFloat(amount_paid ? amount_paid : "0.00"));
  }, [final_amount, amount_paid])

  React.useEffect(() => {
    if (status === "Delivered") {
      let errorset = false;
      order_items.forEach(oi => {
        const totalOrderItemWarehouseQuantity = (oi.warehouse_quantities ?? []).reduce((pre, current) => {
          return pre + current.quantity;
        }, 0);
        if((!oi.warehouse_quantities || totalOrderItemWarehouseQuantity !== oi.quantity) && !errorset) {
          errorset = true;
        }
      })
      if(errorset) {
        form.setError("order_items", {
          message: "Please select warehouse quantities for all order items!"
        });
      } else {
        form.clearErrors("order_items");
        form.trigger("order_items");
      }
    } else {
      form.clearErrors("order_items");
      form.trigger("order_items");
    }
  }, [status, order_items])

  React.useEffect(() => {
    if (carpenter_id) {
      const newOrderItemsPromises = order_items.map(async (oi) => {
        const queryParams = new URLSearchParams();
        queryParams.append("item_id", oi.item_id.toString());
        queryParams.append("carpenter_id", carpenter_id.toString());
        try {
          const res = await request.get(
            `/inventory/getItemRatesWithCommission?` + queryParams.toString()
          );
          if (res.status === 200) {
            const response = res.data.data as selectedItemRateWithCommissionType;
            if (response.carpenter_rates) {
              return {
                ...oi,
                carpenter_commision: calculateTotalCommission(
                  response.carpenter_rates.commision ?? undefined,
                  response.carpenter_rates.commision_type ?? undefined,
                  oi.total_value,
                  oi.quantity
                ),
                carpenter_commision_type:
                  response.carpenter_rates.commision_type ?? undefined,
              };
            }
          }
        } catch (error) {
          console.error("Error fetching item rates:", error);
        }
        return oi;
      });
      Promise.all(newOrderItemsPromises).then((newOrderItems) => {
        form.setValue("order_items", newOrderItems);
      });
    }
  }, [carpenter_id])

  React.useEffect(() => {
    if (architect_id) {
      const newOrderItemsPromises = order_items.map(async (oi) => {
        const queryParams = new URLSearchParams();
        queryParams.append("item_id", oi.item_id.toString());
        queryParams.append("architect_id", architect_id.toString());
        try {
          const res = await request.get(
            `/inventory/getItemRatesWithCommission?` + queryParams.toString()
          );
          if (res.status === 200) {
            const response = res.data.data as selectedItemRateWithCommissionType;
            if (response.architect_rates) {
              return {
                ...oi,
                architect_commision: calculateTotalCommission(
                  response.architect_rates.commision ?? undefined,
                  response.architect_rates.commision_type ?? undefined,
                  oi.total_value,
                  oi.quantity
                ),
                architect_commision_type:
                  response.architect_rates.commision_type ?? undefined,
              };
            }
          }
        } catch (error) {
          console.error("Error fetching item rates:", error);
        }
        return oi;
      });
      Promise.all(newOrderItemsPromises).then((newOrderItems) => {
        form.setValue("order_items", newOrderItems);
      });
    }
  }, [architect_id])

  return (
    <div className="w-full h-full flex space-x-2">
      <Form {...form}>
        <form
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
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
          </div>
          <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
            <FormField
              control={form.control}
              name="carpenter_id"
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
              name="architect_id"
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
                    carpenter_id={form.getValues("carpenter_id")}
                    architect_id={form.getValues("architect_id")}
                    delivered={status === "Delivered"}
                    value={order_items}
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
        <div className="text-2xl font-cubano flex items-center justify-between">
          <span>Order Summary</span>
          <ShowCommissionButton/>
        </div>
        <div className="w-full h-4/6 mb-1 overflow-y-auto bg-gradient-to-t from-accent mt-2 rounded-sm hide-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center p-0 h-8">Item Name</TableHead>
                <TableHead className="text-center p-0 h-8">Quantity</TableHead>
                <TableHead className="text-center p-0 h-8">Rate</TableHead>
                <TableHead className="text-center p-0 h-8">
                  Total Value
                </TableHead>
                {showCommission && <TableHead className="text-center p-0 h-8">
                  Arch. C.
                </TableHead>}
                {showCommission && <TableHead className="text-center p-0 h-8">
                  Carp. C.
                </TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody className="h-1/2 overflow-scroll">
              {order_items.map((item) => {
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
                    {showCommission && <TableCell className="text-center p-0 py-2">
                      {item.architect_commision}
                    </TableCell>}
                    {showCommission && <TableCell className="text-center p-0 py-2">
                      {item.carpenter_commision}
                    </TableCell>}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <Card className="w-full h-40">
          <CardContent className="p-2 py-1">
            <div className="w-full text-2xl font-mono flex justify-between">
              Total Order Value
              <span>{total_order_value.toFixed(2)}</span>
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
