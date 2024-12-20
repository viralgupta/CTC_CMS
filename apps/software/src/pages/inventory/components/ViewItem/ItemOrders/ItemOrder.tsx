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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAllItems } from "@/hooks/items";
import { viewItemAtom, viewItemIDAtom, viewItemType } from "@/store/Items";
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
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";

const ItemOrders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  const [viewItem, setViewItem] = useRecoilState(viewItemAtom);
  const setViewItemID = useSetRecoilState(viewItemIDAtom);
  const { refetchItems } = useAllItems();

  const columns: ColumnDef<viewItemType["item_orders"][number]>[] = [
    {
      id: "vendor_name",
      accessorKey: "vendor_name",
      header: "Vendor Name",
      cell: ({ row }) => {
        if (row.original.vendor_name == "") {
          return "--";
        } else {
          return row.original.vendor_name;
        }
      },
    },
    {
      id: "ordered_quantity",
      accessorKey: "ordered_quantity",
      header: "Order Quantity",
    },
    {
      id: "order_date",
      accessorKey: "order_date",
      header: "Order Date",
      cell: ({ row }) => {
        return parseDateToString(row.original.order_date);
      },
    },
    {
      id: "received_quantity",
      accessorKey: "received_quantity",
      header: "Receive Quantity",
      cell: ({ row }) => {
        if (row.original.received_quantity) {
          return (
            <ItemStoreQuantity
              warehouseQuantities={row.original.i_o_w_q.map((iowq) => {
                const foundWarehouseQuantity = viewItem?.warehouse_quantities.find(
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
                {row.original.received_quantity}
              </span>
            </ItemStoreQuantity>
          );
        } else {
          return "--";
        }
      },
    },
    {
      id: "receive_date",
      accessorKey: "receive_date",
      header: "Receive Date",
      cell: ({ row }) => {
        return parseDateToString(row.original.receive_date);
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Popover>
            <PopoverTrigger>
              <EllipsisVertical className="border rounded-md p-0.5 aspect-square" />
            </PopoverTrigger>
            <PopoverContent className="flex space-x-2">
              <EditItemOrder itemOrder={row.original}>
                <Button variant={"outline"} className="gap-2">
                  <Pencil className="w-4 h-4" />
                  Edit Item Order
                </Button>
              </EditItemOrder>
              <RecieveItemOrder itemOrder={row.original}>
                <Button
                  disabled={(row.original.received_quantity ?? 0) > 0}
                  variant={"outline"}
                  className="gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Receive Item Order
                </Button>
              </RecieveItemOrder>
              <DeleteItemOrder id={row.original.id}>
                <Button variant={"outline"} className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Item Order
                </Button>
              </DeleteItemOrder>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ];
  
  const CreateItemOrderForm = () => {
    const [open2, setOpen2] = React.useState(false);
    const form = useForm<z.infer<typeof createItemOrderType>>({
      resolver: zodResolver(createItemOrderType),
      reValidateMode: "onChange",
      defaultValues: {
        item_id: viewItem?.id,
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
        <div className="max-h-96 overflow-y-auto hide-scroll flex flex-col">
          <DataTable
            data={viewItem?.item_orders ?? []}
            key={"Item Orders"}
            columns={columns}
            columnFilters={false}
            defaultColumn={{
              meta: {
                headerStyle: {
                  textAlign: "center",
                },
              },
            }}
            message="No Item Orders Found!"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemOrders;
