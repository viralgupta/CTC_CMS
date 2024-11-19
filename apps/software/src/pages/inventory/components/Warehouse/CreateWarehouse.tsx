import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "@/components/ui/Spinner";
import { createWarehouseType } from "@type/api/item";
import request from "@/lib/request";
import { Input } from "@/components/ui/input";
import { useAllWarehouse } from "@/hooks/warehouse";

const CreateWarehouseForm = () => {
  const { refetchWarehouses } = useAllWarehouse();
  const form = useForm<z.infer<typeof createWarehouseType>>({
    resolver: zodResolver(createWarehouseType),
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createWarehouseType>) {
    try {
      const res = await request.post("/inventory/createWarehouse", values);
      if (res.status == 200) {
        form.reset();
        refetchWarehouses();
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Warehouse Name</FormLabel>
                <FormControl>
                  <Input
                    onChange={(e) => field.onChange(e.target.value ?? "")}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting && <Spinner />}
          {!form.formState.isSubmitting && "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default CreateWarehouseForm;