import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import SearchItem from "@/pages/inventory/components/SearchItem";
import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { useAllItems } from "@/hooks/items";
import {
  itemType,
  selectedItemRateAtom,
  selectedItemRateType,
} from "@/store/Items";
import request from "@/lib/request";
import { useRecoilState } from "recoil";
import { createEstimateType } from "@type/api/estimate";
import { FormLabelWithToolTip } from "@/pages/order/components/Input/SelectOrderItems/AddNewItem";

const AddNewItem = ({
  onSubmit: onAdd,
  value,
  children,
}: {
  onSubmit: (
    value: z.infer<typeof createEstimateType>["estimate_items"][number]
  ) => void;
  value?: z.infer<typeof createEstimateType>["estimate_items"][number];
  children?: React.ReactNode;
}) => {
  const [selectedItemRates, setSelectedItemRates] =
    useRecoilState(selectedItemRateAtom);
  const [foundItem, setFoundItem] = React.useState<itemType | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { items } = useAllItems();

  const form = useForm<
    z.infer<typeof createEstimateType>["estimate_items"][number]
  >({
    resolver: zodResolver(createEstimateType.shape.estimate_items.element),
    reValidateMode: "onChange",
    defaultValues: {
      item_id: value?.item_id ?? undefined,
      quantity: value?.quantity ?? 1,
      rate: value?.rate ?? undefined,
      total_value: value?.total_value ?? undefined,
    },
  });

  async function onSubmit(
    value: z.infer<typeof createEstimateType>["estimate_items"][number]
  ) {
    onAdd(value);
    setSelectedItemRates(null);
    setFoundItem(null);
    setOpen(false);
    form.reset();
  }

  async function getItemRate(item_id: number) {
    setLoading(true);
    const res = await request(`/inventory/getItemRates?item_id=${item_id}`);
    if (res.status == 200) {
      setSelectedItemRates(res.data.data as selectedItemRateType);
      setLoading(false);
    }
  }

  const [item_id, quantity, rate] = form.watch(["item_id", "quantity", "rate"]);

  React.useEffect(() => {
    form.setValue(
      "total_value",
      (
        (quantity ?? 0) *
        (selectedItemRates?.multiplier ?? 1) *
        (rate ?? 0)
      ).toFixed(2)
    );
  }, [quantity, rate, selectedItemRates]);

  React.useEffect(() => {
    setFoundItem(null);
    if (!item_id || !open) return;
    setFoundItem(items.filter((i) => i.id == item_id)[0] ?? null);
  }, [item_id]);

  React.useEffect(() => {
    if (!foundItem) return;
    form.setValue("rate", foundItem?.sale_rate ?? 0);
    getItemRate(foundItem.id);
  }, [foundItem]);

  return (
    <Dialog
      onOpenChange={(o) => {
        setOpen(o);
        if (o && value) {
          getItemRate(item_id);
        }
      }}
      open={open}
    >
      <DialogTrigger className="w-full" asChild={children ? true : false}>
        {children ? (
          children
        ) : (
          <Input className="w-full" placeholder="Add Item..." />
        )}
      </DialogTrigger>
      <DialogContent size="4xl">
        <DialogHeader>
          <DialogTitle>Add a new item</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 w-full h-full"
          >
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
              <FormField
                control={form.control}
                name="item_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Item</FormLabel>
                    <FormControl>
                      <SearchItem
                        value={field.value}
                        onChange={field.onChange}
                        className="rounded-lg w-full"
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
                name="quantity"
                render={({ field }) => (
                  <FormItem className="w-2/6">
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <div className="w-full h-full flex gap-x-0.5">
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : ""
                            )
                          }
                        />
                        <Input disabled value={"piece"} className="w-16" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem className="w-2/6">
                    <FormLabelWithToolTip
                      heading="Rate"
                      data={[
                        `Min Rate: ₹${selectedItemRates?.min_rate ?? " --"}`,
                        `Sale Rate: ₹${selectedItemRates?.sale_rate ?? foundItem?.sale_rate ?? " --"}`,
                        `Last Order Rate: ₹${selectedItemRates?.order_items[0]?.rate ?? " --"}`,
                      ]}
                    />
                    <FormControl>
                      <div className="w-full h-full flex gap-x-0.5">
                        <Input
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : ""
                            )
                          }
                        />
                        <Input
                          disabled
                          value={foundItem?.rate_dimension ?? "--"}
                          className="w-16"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="w-1/6">
                <FormLabel>Multiplier</FormLabel>
                <FormControl>
                  <Input disabled value={selectedItemRates?.multiplier ?? 1} />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormField
                control={form.control}
                name="total_value"
                render={({ field }) => (
                  <FormItem className="w-1/6">
                    <FormLabel>Total Value</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              disabled={form.formState.isSubmitting || loading}
              type="button"
              className="w-full"
              onClick={() => form.handleSubmit(onSubmit)()}
            >
              {(form.formState.isSubmitting || loading) && <Spinner />}
              {!form.formState.isSubmitting && !loading && "Add Item"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewItem;
