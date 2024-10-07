import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import allItemsAtom, {
  viewItemAtom,
  editItemQuantityIDAtom,
  viewItemIDAtom,
} from "@/store/Items";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { editQuantityType } from "../../../../../../packages/types/api/item";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import request from "@/lib/request";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { Input } from "@/components/ui/input";
import React from "react";

const EditItemQuantity = () => {
  const [editItemQuantityID, setEditItemQuantityID] = useRecoilState(editItemQuantityIDAtom);
  const viewItem = useRecoilValue(viewItemAtom);
  const setViewItemID = useSetRecoilState(viewItemIDAtom);
  const setAllItems = useSetRecoilState(allItemsAtom);

  const EditItemQuantityForm = () => {
    const [totalValue, setTotalValue] = React.useState<number | null>(viewItem!.quantity);

    const form = useForm<z.infer<typeof editQuantityType>>({
      resolver: zodResolver(editQuantityType),
      reValidateMode: "onChange",
      defaultValues: {
        item_id: viewItem!.id,
        operation: "subtract",
        quantity: 0,
      },
    });

    async function onSubmit(values: z.infer<typeof editQuantityType>) {
      const res = await request.post("/inventory/editQuantity", values);
      if (res.status == 200) {
        setEditItemQuantityID(null);
        setViewItemID(null);
        setAllItems([]);
      }
    }

    const [quantity, operation] = form.watch(["quantity", "operation"])

    React.useEffect(() => {
      if (!viewItem || (form.getValues("operation") !== "add" && form.getValues("operation") !== "subtract")){
        setTotalValue(null);
        return;
      };
      if (form.getValues("operation") == "add") {
        setTotalValue(viewItem.quantity + form.getValues("quantity"));
      } else {
        setTotalValue(viewItem.quantity - form.getValues("quantity"));
      };
    }, [quantity, operation])
    

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
            <FormField
              control={form.control}
              name="operation"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Operation</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Subtract" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subtract">Subtract</SelectItem>
                        <SelectItem value="add">Add</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"                    
                      {...field}
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
          <div className="flex justify-between items-center">
            <div>Total Quantity: {totalValue == null ? "null" : totalValue}</div>
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting && <Spinner />}
              {!form.formState.isSubmitting && "Edit Quantity"}
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <Dialog
      open={editItemQuantityID ? true : false}
      onOpenChange={(open) => {
        if (!open) {
          setEditItemQuantityID(null);
        }
      }}
    >
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Edit Item Quantity</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {viewItem && <EditItemQuantityForm />}
        {!viewItem && (
          <div className="w-full h-40 flex items-center justify-center">
            Unable to find item to edit quantity!!!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditItemQuantity;
