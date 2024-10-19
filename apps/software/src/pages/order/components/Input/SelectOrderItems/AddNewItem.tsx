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
import { createOrderType } from "@type/api/order";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { z } from "zod";
import SearchItem from "@/pages/inventory/components/SearchItem";
import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { useAllItems } from "@/hooks/items";
import { Info } from "lucide-react";
import { calculateCommissionFromTotalCommission } from "@/lib/utils";
import {
  itemType,
  selectedItemRateAtom,
  selectedItemRateType,
} from "@/store/Items";
import request from "@/lib/request";
import { useRecoilState } from "recoil";

const AddNewItem = ({
  onSubmit: onAdd,
  value,
  children,
}: {
  onSubmit: (
    value: z.infer<typeof createOrderType>["order_items"][number]
  ) => void;
  value?: z.infer<typeof createOrderType>["order_items"][number];
  children?: React.ReactNode;
}) => {
  const [selectedItemRates, setSelectedItemRates] =
    useRecoilState(selectedItemRateAtom);
  const [architectCommission, setArchitectCommission] = React.useState("0.00");
  const [carpanterCommision, setCarpenterCommission] = React.useState("0.00");
  const [foundItem, setFoundItem] = React.useState<itemType | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { items } = useAllItems();

  const form = useForm<z.infer<typeof createOrderType>["order_items"][number]>({
    resolver: zodResolver(createOrderType.shape.order_items.element),
    reValidateMode: "onChange",
    defaultValues: {
      item_id: value?.item_id ?? undefined,
      quantity: value?.quantity ?? 1,
      rate: value?.rate ?? undefined,
      total_value: value?.total_value ?? undefined,
      architect_commision: value
        ? calculateCommissionFromTotalCommission(
            value?.architect_commision,
            value?.architect_commision_type,
            value?.total_value,
            value?.quantity ?? 0
          ).value.toString()
        : "0.00",
      architect_commision_type: value?.architect_commision_type ?? undefined,
      carpanter_commision: value
        ? calculateCommissionFromTotalCommission(
            value?.carpanter_commision ?? "0.00",
            value?.carpanter_commision_type,
            value?.total_value ?? "0.00",
            value?.quantity ?? 0
          ).value.toString()
        : "0.00",
      carpanter_commision_type: value?.carpanter_commision_type ?? undefined,
    },
  });

  async function onSubmit(
    value: z.infer<typeof createOrderType>["order_items"][number]
  ) {
    const finalValue = {
      ...value,
      architect_commision: parseFloat(architectCommission).toFixed(2),
      carpanter_commision: parseFloat(carpanterCommision).toFixed(2),
    };
    onAdd(finalValue);
    setSelectedItemRates(null);
    setFoundItem(null);
    setOpen(false);
    form.reset();
  }

  function calculateTotalCommission(
    value: z.infer<
      typeof createOrderType
    >["order_items"][number]["architect_commision"],
    type: z.infer<
      typeof createOrderType
    >["order_items"][number]["architect_commision_type"],
    itemValue: string
  ) {
    if (!type) return "0.00";
    if (type == "perPiece") {
      return (parseFloat(value ?? "0.00") * form.getValues("quantity")).toFixed(
        2
      );
    } else {
      return (
        (parseFloat(value ?? "0.00") / 100) *
        parseFloat(itemValue)
      ).toFixed(2);
    }
  }

  async function getItemRate(item_id: string) {
    setLoading(true);
    const res = await request(`/inventory/getItemRates?item_id=${item_id}`);
    if(res.status == 200){
      setSelectedItemRates(res.data.data as selectedItemRateType);
      setLoading(false);
    }
  }

  const [
    item_id,
    quantity,
    rate,
    architect_commision,
    architect_commision_type,
    carpanter_commision,
    carpanter_commision_type,
    total_value,
  ] = form.watch([
    "item_id",
    "quantity",
    "rate",
    "architect_commision",
    "architect_commision_type",
    "carpanter_commision",
    "carpanter_commision_type",
    "total_value",
  ]);

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
    setArchitectCommission(
      calculateTotalCommission(
        architect_commision,
        architect_commision_type,
        total_value
      )
    );
  }, [total_value, architect_commision, architect_commision_type]);

  React.useEffect(() => {
    setCarpenterCommission(
      calculateTotalCommission(
        carpanter_commision,
        carpanter_commision_type,
        total_value
      )
    );
  }, [carpanter_commision, carpanter_commision_type, total_value]);

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
        if(o && value) {
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
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
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
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row items-end">
              <FormField
                control={form.control}
                name="architect_commision"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabelWithToolTip
                      heading="Architect Commission"
                      data={[
                        `Last Order Arch. Commission: ₹${selectedItemRates?.order_items[0]?.architect_commision ?? " --"}`,
                      ]}
                    />
                    <FormControl>
                      <Input
                        type="number"
                        onChange={field.onChange}
                        value={field.value ?? 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="architect_commision_type"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabelWithToolTip
                      heading="Architect Commission Type"
                      data={[
                        `Last Order Arch. Commission Type: ₹${selectedItemRates?.order_items[0]?.architect_commision_type ?? " --"}`,
                      ]}
                    />
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            % Percentage
                          </SelectItem>
                          <SelectItem value="perPiece">Per Piece</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="w-full">
                <FormLabel>Total Architect Commission</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    disabled
                    value={architectCommission}
                  />
                </FormControl>
              </FormItem>
            </div>
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row items-end pb-2">
              <FormField
                control={form.control}
                name="carpanter_commision"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabelWithToolTip
                      heading="Carpenter Commission"
                      data={[
                        `Last Order Carp. Commission: ₹${selectedItemRates?.order_items[0]?.carpanter_commision ?? " --"}`,
                      ]}
                    />
                    <FormControl>
                      <Input
                        type="number"
                        onChange={field.onChange}
                        value={field.value ?? 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carpanter_commision_type"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabelWithToolTip
                      heading="Carpenter Commission Type"
                      data={[
                        `Last Order Carp. Commission Type: ₹${selectedItemRates?.order_items[0]?.carpanter_commision_type ?? " --"}`,
                      ]}
                    />
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            % Percentage
                          </SelectItem>
                          <SelectItem value="perPiece">Per Piece</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="w-full">
                <FormLabel>Total Carpenter Commission</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    disabled
                    value={carpanterCommision}
                  />
                </FormControl>
              </FormItem>
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

const FormLabelWithToolTip = ({
  heading,
  data,
}: {
  heading: string;
  data: string[];
}) => {
  return (
    <FormLabel className="flex justify-between items-end" key={heading}>
      <span>{heading}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-5 aspect-square mt-1 translate-y-1" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex justify-around">
              {data.map((d, i) => {
                return (
                  <div
                    key={i}
                    className={
                      i !== data.length - 1 ? "pr-1.5 mr-1.5 border-r-2" : ""
                    }
                  >
                    {d}
                  </div>
                );
              })}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </FormLabel>
  );
};

export default AddNewItem;