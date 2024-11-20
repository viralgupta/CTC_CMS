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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAllItems } from "@/hooks/items";
import { viewItemAtom, viewItemIDAtom } from "@/store/Items";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { useRecoilState, useSetRecoilState } from "recoil";
import Spinner from "@/components/ui/Spinner";
import { createItemOrderType } from "@type/api/item";
import { z } from "zod";
import request from "@/lib/request";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { parseDateToString } from "@/lib/utils";
import { CreditCard, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import EditItemOrder from "./EditItemOrder";
import DeleteItemOrder from "./DeleteItemOrder";
import RecieveItemOrder from "./ReceiveItemOrder";
import CreditWarehouseQuantity from "../../inputs/CreditWarehouseQuantity";
import { ItemStoreQuantity } from "../ItemCard";
import { useVirtualizer } from "@tanstack/react-virtual";

const ItemOrders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  const [viewItem, setViewItem] = useRecoilState(viewItemAtom);
  const setViewItemID = useSetRecoilState(viewItemIDAtom);
  const { refetchItems } = useAllItems();

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: (viewItem?.item_orders ?? []).length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 2,
  });

  const CreateItemOrderForm = () => {
    const [open2, setOpen2] = React.useState(false);
    const form = useForm<z.infer<typeof createItemOrderType>>({
      resolver: zodResolver(createItemOrderType),
      reValidateMode: "onChange",
      defaultValues: {
        item_id: viewItem?.id ?? '',
        vendor_name: "",
        ordered_quantity: 0,
        received_quantity: 0,
        // @ts-expect-error
        order_date: new Date().toISOString(),
      },
    });

    async function onSubmit(values: z.infer<typeof createItemOrderType>) {
      const total_quantity = (warehouse_quantities ?? []).reduce(
        (acc, curr) => acc + curr.quantity,
        0
      );
      if (total_quantity !== received_quantity) {
        form.setError("warehouse_quantities", {
          type: "custom",
          message:
            "Received quantity must be equal to the total quantity in the warehouse.",
        });
        return;
      }
      const res = await request.post("/inventory/createItemOrder", values);
      if (res.status == 200) {
        setOpen2(false);
        setOpen(false);
        setViewItemID(null);
        setViewItem(null);
        refetchItems();
      }
    }

    const [received_quantity, warehouse_quantities] = form.watch([
      "received_quantity",
      "warehouse_quantities",
    ]);

    React.useEffect(() => {
      if (!form.getValues("receive_date") && received_quantity) {
        // @ts-expect-error
        form.setValue("receive_date", new Date().toISOString());
      }
    }, [received_quantity]);

    React.useEffect(() => {
      if ((received_quantity ?? 0) > 0) {
        const total_quantity = (warehouse_quantities ?? []).reduce(
          (acc, curr) => acc + curr.quantity,
          0
        );
        if (total_quantity !== received_quantity) {
          form.setError("warehouse_quantities", {
            type: "custom",
            message:
              "Received quantity must be equal to the total quantity in the warehouse.",
          });
        } else {
          form.clearErrors("warehouse_quantities");
        }
      } else {
        form.clearErrors("warehouse_quantities");
      }
    }, [received_quantity, warehouse_quantities]);

    return (
      <Dialog open={open2} onOpenChange={setOpen2}>
        <DialogTrigger asChild>
          <Button variant={"outline"} className="w-full mb-4">
            Create Item Order
          </Button>
        </DialogTrigger>
        <DialogContent size="2xl">
          <DialogHeader>
            <DialogTitle>Create Item Order</DialogTitle>
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
              <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
                <FormField
                  control={form.control}
                  name="received_quantity"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Receive Quantity</FormLabel>
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
                      <FormLabel>Receive Date</FormLabel>
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
                          totalQuantity={
                            form.getValues("received_quantity") ?? 0
                          }
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
                {!form.formState.isSubmitting && "Create Item Order"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="4xl">
        <DialogHeader>
          <DialogTitle>Item Orders</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <CreateItemOrderForm />
        <div className="max-h-96 overflow-y-auto hide-scroll" ref={parentRef}>
          <Table style={{ height: `${virtualizer.getTotalSize()}px` }}>
            <TableCaption>A list of item orders.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Vendor Name</TableHead>
                <TableHead className="text-center">Order Quantity</TableHead>
                <TableHead className="text-center">Order Date</TableHead>
                <TableHead className="text-center">Receive Quantity</TableHead>
                <TableHead className="text-center">Receive Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewItem &&
                (viewItem.item_orders ?? []).length > 0 &&
                virtualizer.getVirtualItems().map((virtualRow, index) => {
                  const io = viewItem.item_orders[virtualRow.index];
                  return (
                    <TableRow
                      key={io.id}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start - index * virtualRow.size}px)`,
                      }}
                    >
                      <TableCell className="text-center">
                        {io.vendor_name == "" ? "--" : io.vendor_name}
                      </TableCell>
                      <TableCell className="text-center">
                        {io.ordered_quantity}
                      </TableCell>
                      <TableCell className="text-center">
                        {parseDateToString(io.order_date)}
                      </TableCell>
                      <TableCell className="text-center">
                        {io.received_quantity ? (
                          <ItemStoreQuantity
                            warehouseQuantities={io.i_o_w_q.map((iowq) => {
                              const foundWarehouseQuantity =
                                viewItem?.warehouse_quantities.find(
                                  (wq) => wq.id == iowq.warehouse_quantity_id
                                );
                              if (foundWarehouseQuantity) {
                                return {
                                  id: iowq.warehouse_quantity_id,
                                  warehouse: foundWarehouseQuantity.warehouse,
                                  quantity: iowq.quantity,
                                };
                              } else {
                                return {
                                  id: iowq.warehouse_quantity_id,
                                  warehouse: {
                                    name: "--",
                                  },
                                  quantity: iowq.quantity,
                                };
                              }
                            })}
                          >
                            <span className="border p-2 rounded-md cursor-pointer">
                              {io.received_quantity}
                            </span>
                          </ItemStoreQuantity>
                        ) : (
                          "--"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {parseDateToString(io.receive_date)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Popover>
                          <PopoverTrigger>
                            <EllipsisVertical className="border rounded-md p-0.5 aspect-square" />
                          </PopoverTrigger>
                          <PopoverContent className="flex space-x-2">
                            <EditItemOrder itemOrder={io}>
                              <Button variant={"outline"} className="gap-2">
                                <Pencil className="w-4 h-4" />
                                Edit Item Order
                              </Button>
                            </EditItemOrder>
                            <RecieveItemOrder itemOrder={io}>
                              <Button
                                disabled={(io.received_quantity ?? 0) > 0}
                                variant={"outline"}
                                className="gap-2"
                              >
                                <CreditCard className="w-4 h-4" />
                                Receive Item Order
                              </Button>
                            </RecieveItemOrder>
                            <DeleteItemOrder id={io.id}>
                              <Button variant={"outline"} className="gap-2">
                                <Trash2 className="w-4 h-4" />
                                Delete Item Order
                              </Button>
                            </DeleteItemOrder>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemOrders;
