import { Button } from "@/components/ui/button";
import React from "react";
import { z } from "zod";
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
import { parseBalanceToFloat } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { settleBalanceType } from "@type/api/customer";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/Spinner";

const SettleBalanceForm = ({
  onSubmit,
  existingBalance
}: {
  onSubmit: (values: Omit<z.infer<typeof settleBalanceType>, "customer_id" | "amount"> & { amount: string }) => void;
  existingBalance: string
}) => {
  const [totalValue, setTotalValue] = React.useState<number | null>(
    parseBalanceToFloat(existingBalance)
  );

  const form = useForm<
    Omit<Omit<z.infer<typeof settleBalanceType>, "customer_id">, "amount"> & { amount: string }
  >({
    resolver: zodResolver(settleBalanceType.omit({ customer_id: true, amount: true }).extend({ amount: z.string() })),
    reValidateMode: "onChange",
    defaultValues: {
      operation: "subtract",
      amount: "0",
    },
  });

  const [amount, operation] = form.watch(["amount", "operation"]);

  React.useEffect(() => {
    if (!existingBalance || (form.getValues("operation") !== "add" && form.getValues("operation") !== "subtract")){
      setTotalValue(null);
      return;
    };
    if (form.getValues("operation") == "add") {
      setTotalValue(parseBalanceToFloat(existingBalance) + parseBalanceToFloat(form.getValues("amount")));
    } else {
      setTotalValue(parseBalanceToFloat(existingBalance) - parseBalanceToFloat(form.getValues("amount")));
    };
  }, [amount, operation])

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
            name="amount"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? e.target.value : ""
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
          <div>Final Balance: {totalValue == null ? "null" : totalValue}</div>
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting && <Spinner />}
            {!form.formState.isSubmitting && "Edit Balance"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SettleBalanceForm;