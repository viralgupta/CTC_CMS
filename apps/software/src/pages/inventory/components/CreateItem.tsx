import React from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "@/components/ui/Spinner";
import SelectCategory from "@/components/Inputs/SelectCategory";
import RateDimension from "@/components/Inputs/RateDimension";
import { createItemType } from "@type/api/item";
import request from "@/lib/request";
import { useAllItems } from "@/hooks/items";

const CreateItemForm = () => {
  const { refetchItems } = useAllItems();
  
  const form = useForm<z.infer<typeof createItemType>>({
    resolver: zodResolver(createItemType),
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      multiplier: 1,
    },
  });

  async function onSubmit(values: z.infer<typeof createItemType>) {

    try {
      const res = await request.post("/inventory/createItem", values);
      if(res.status == 200){
        form.reset();
        refetchItems();
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
            name="category"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Item Category</FormLabel>
                <FormControl>
                  <SelectCategory onValueChange={field.onChange} />
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
                  <RateDimension onValueChange={field.onChange} />
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
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Item Current Quantity</FormLabel>
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
          {!form.formState.isSubmitting && "Submit"}
        </Button>
      </form>
    </Form>
  );
};

const CreateItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="4xl">
        <DialogHeader>
          <DialogTitle>Create a new item in inventory</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <CreateItemForm />
      </DialogContent>
    </Dialog>
  );
};

export default CreateItem;
