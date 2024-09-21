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
  viewItemIDAtom,
  editItemIDAtom,
} from "@/store/inventory/Items";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { editItemType } from "../../../../../packages/types/api/item";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import request from "@/utils/request";
import { Button } from "../ui/button";
import Spinner from "../ui/Spinner";
import { Input } from "../ui/input";
import SelectCategory from "./SelectCategory";
import RateDimension from "./RateDimension";

const EditItem = () => {
  const [editItemID, setEditItemID] = useRecoilState(editItemIDAtom);
  const viewItem = useRecoilValue(viewItemAtom);
  const setViewItemID = useSetRecoilState(viewItemIDAtom);
  const setAllItems = useSetRecoilState(allItemsAtom);

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
        setEditItemID(null);
        setViewItemID(null);
        setAllItems([]);
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
      open={editItemID ? true : false}
      onOpenChange={(open) => {
        if (!open) {
          setEditItemID(null);
        }
      }}
    >
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

export default EditItem;
