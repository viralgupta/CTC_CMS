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
import Spinner from "@/components/ui/Spinner";
import request from "@/lib/request";
import SearchCustomer from "@/pages/customer/components/SearchCustomer";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEstimateType } from "@type/api/estimate";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SelectEstimateItems from "./Input/SelectEstimateItems/SelectEstimateItems";
import { useAllItems } from "@/hooks/items";
import React from "react";
import { useAllEstimates } from "@/hooks/estimate";

const CreateEstimate = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="w-full mb-4 text-xl font-cubano">
          Create New Estimate
        </Button>
      </DialogTrigger>
      <DialogContent size="7xl">
        <DialogHeader>
          <DialogTitle>Create A New Estimate</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <CreateEstimateForm />
      </DialogContent>
    </Dialog>
  );
};

const CreateEstimateForm = () => {
  const { refetchEstimates } = useAllEstimates()
  const { items: allItems } = useAllItems();

  const form = useForm<z.infer<typeof createEstimateType>>({
    resolver: zodResolver(createEstimateType),
    reValidateMode: "onChange",
    defaultValues: {
      estimate_items: [],
    },
  });

  async function onSubmit(values: z.infer<typeof createEstimateType>) {
    try {
      const res = await request.post("/estimate/createEstimate", values);
      if (res.status == 200) {
        form.reset();
        refetchEstimates();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const [total_estimate_value, set_total_estimate_value] = React.useState(0);

  const [estimate_items] = form.watch(["estimate_items"]);

  React.useEffect(() => {
    set_total_estimate_value(
      estimate_items.reduce((pre, current) => {
        return pre + parseFloat(current.total_value ?? "0.00");
      }, 0)
    );
  }, [estimate_items]);

  return (
    <div className="w-full h-full flex space-x-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-1/2 h-full flex flex-col items-end justify-between"
        >
          <div className="w-full space--4">
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
              name="estimate_items"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Estimate Items</FormLabel>
                  <FormControl>
                    <SelectEstimateItems
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            className=""
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            {form.formState.isSubmitting && <Spinner />}
            {!form.formState.isSubmitting && "Submit"}
          </Button>
        </form>
      </Form>
      <div className="w-1/2 h-full rounded-md border p-4">
        <span className="text-2xl font-cubano">Estimate Summary</span>
        <div className="w-full h-72 mb-1 overflow-y-auto bg-gradient-to-t from-accent mt-2 rounded-sm hide-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center p-0 h-8">Item Name</TableHead>
                <TableHead className="text-center p-0 h-8">Quantity</TableHead>
                <TableHead className="text-center p-0 h-8">Rate</TableHead>
                <TableHead className="text-center p-0 h-8">
                  Total Value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="h-1/2 overflow-scroll">
              {form.getValues("estimate_items").map((item, index) => {
                const foundItem = allItems.find((i) => i.id === item.item_id);
                return (
                  <TableRow key={index} className="leading-3 p-0">
                    <TableCell className="text-center p-0 py-2">
                      {foundItem?.name ?? ""}
                    </TableCell>
                    <TableCell className="text-center p-0 py-2">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-center p-0 py-2">{`${item.rate} Per ${foundItem?.rate_dimension ?? ""}`}</TableCell>
                    <TableCell className="text-center p-0 py-2">
                      {item.total_value}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="w-full text-2xl font-mono flex justify-between">
          Total Estimate Value
          <span>{total_estimate_value.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CreateEstimate;
