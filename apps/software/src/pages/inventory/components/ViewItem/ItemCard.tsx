import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BoxIcon, Edit2Icon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
  viewItemAtom,
  viewItemIDAtom,
  viewItemType,
} from "@/store/Items";
import SelectCategory from "@/components/Inputs/SelectCategory";
import RateDimension from "@/components/Inputs/RateDimension";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { Input } from "@/components/ui/input";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import request from "@/lib/request";
import React from "react";
import { editItemType } from "@type/api/item";
import { useAllItems } from "@/hooks/items";
import ItemOrders from "./ItemOrders/ItemOrder";

export default function ItemCard({ item }: { item: viewItemType | null }) {

  if (!item) {
    return (
      <Card className="w-full p-6">
        <Skeleton className="w-full h-40" />
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                ID: {item.id}
              </span>
            </div>
            <div className="flex space-x-2 mt-2">
              <EditItem>
                <Button size="sm" variant="outline">
                  <Edit2Icon className="h-4 w-4 mr-2" />
                  Edit Item
                </Button>
              </EditItem>
              <ItemOrders item_id={item.id} item_orders={item.item_orders}>
                <Button size="sm" variant="outline">
                  <BoxIcon className="h-4 w-4 mr-2" />
                  Item Orders
                </Button>
              </ItemOrders>
              <DeleteItem itemId={item.id}>
                <Button size="sm" variant="outline">
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete Item
                </Button>
              </DeleteItem>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="mr-10">
              <span className="text-lg font-medium flex items-center">
                Quantity
              </span>
              <p className="text-lg">{item.quantity}</p>
            </div>
            <div className="mr-10">
              <span className="text-lg font-medium flex items-center">
                Min Quantity
              </span>
              <p className="text-lg">{item.min_quantity}</p>
            </div>
            <div className="mr-10">
              <span className="text-lg font-medium flex items-center">
                Category
              </span>
              <p className="text-lg">{item.category}</p>
            </div>
            <div className="mr-10">
              <span className="text-lg font-medium flex items-center">
                Sale Rate
              </span>
              <p className="text-lg">
                ₹{item.sale_rate.toFixed(2)} per&nbsp;{item.rate_dimension}
              </p>
            </div>
            <div className="mr-10">
              <div>
                <span className="text-lg font-medium flex items-center">
                  Min Rate
                </span>
                <p className="text-lg">
                  {item.min_rate
                    ? `₹${item.min_rate.toFixed(2)} per ${item.rate_dimension}`
                    : "null"}
                </p>
              </div>
            </div>
            <div className="mr-10">
              <span className="text-lg font-medium flex items-center">
                Multiplier
              </span>
              <p className="text-lg">{item.multiplier}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


const EditItem = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const [viewItem, setViewItem] = useRecoilState(viewItemAtom);
  const { refetchItems } = useAllItems();
  const setViewItemID = useSetRecoilState(viewItemIDAtom);

  const EditItemForm = () => {
    const form = useForm<z.infer<typeof editItemType>>({
      resolver: zodResolver(editItemType),
      reValidateMode: "onChange",
      defaultValues: {
        item_id: viewItem!.id,
        category: viewItem!.category,
        min_quantity: viewItem!.min_quantity,
        min_rate: viewItem!.min_rate ? viewItem!.min_rate : undefined,
        multiplier: viewItem!.multiplier,
        name: viewItem!.name,
        rate_dimension: viewItem!.rate_dimension,
        sale_rate: viewItem!.sale_rate,
      },
    });

    async function onSubmit(values: z.infer<typeof editItemType>) {
      const res = await request.put("/inventory/editItem", values);
      if (res.status == 200) {
        setOpen(false);
        setViewItemID(null);
        setViewItem(null);
        refetchItems();
      }
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Item Category</FormLabel>
                <FormControl>
                  <SelectCategory onValueChange={field.onChange} defaultValue={field.value}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Item Name</FormLabel>
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
            name="rate_dimension"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Rate Dimension</FormLabel>
                <FormControl>
                  <RateDimension onValueChange={field.onChange} defaultValue={field.value}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="min_rate"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Item Minimum Rate</FormLabel>
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
            name="sale_rate"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Item Sale Rate</FormLabel>
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
        </div>
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="multiplier"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Item Multiplier</FormLabel>
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
            name="min_quantity"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Item Minimum Quantity</FormLabel>
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
        </div>
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting && <Spinner />}
            {!form.formState.isSubmitting && "Edit Quantity"}
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent size="4xl">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {viewItem && <EditItemForm />}
        {!viewItem && (
          <div className="w-full h-40 flex items-center justify-center">
            Unable to find item to edit!!!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};




const DeleteItem = ({
  children,
  itemId,
}: {
  children: React.ReactNode;
  itemId: string;
}) => {
  const { refetchItems } = useAllItems();
  const setViewItemId = useSetRecoilState(viewItemIDAtom);

  const handleDelete = async () => {
    const res = await request.delete("/inventory/deleteItem", {
      data: {
        item_id: itemId,
      },
    });
    if(res.status == 200) {
      refetchItems();
      setViewItemId(null);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete item?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete item and
            remove data from servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
