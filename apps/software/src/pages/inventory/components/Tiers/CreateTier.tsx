import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "@/components/ui/Spinner";
import { createTierType } from "@type/api/item";
import request from "@/lib/request";
import { Input } from "@/components/ui/input";
import { useAllTiers } from "@/hooks/tier";
import SelectedTierItems from "./inputs/SelectTierItems";
import React from "react";

const CreateTier = ({
  defaultValues,
  onSubmit: onSubmitEdit,
  children
}: {
  defaultValues?: z.infer<typeof createTierType>;
  onSubmit?: (values: z.infer<typeof createTierType>) => void;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false)
  const { refetchTiers } = useAllTiers();
  const form = useForm<z.infer<typeof createTierType>>({
    resolver: zodResolver(createTierType),
    reValidateMode: "onChange",
    defaultValues: defaultValues ? defaultValues : {
      name: "",
      tier_items: [],     
    },
  });


  async function onSubmit(values: z.infer<typeof createTierType>) {
    if(onSubmitEdit) {
      onSubmitEdit(values);
      return
    }
    try {
      const res = await request.post("/inventory/createTier", values);
      if (res.status == 200) {
        form.reset();
        refetchTiers();
      }
    } catch (error) {
      console.log(error);
    }
    setOpen(false)
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent size="2xl">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Tier Name</FormLabel>
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
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
              <FormField
                control={form.control}
                name="tier_items"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Selected Tier Items</FormLabel>
                    <FormControl>
                      <SelectedTierItems
                        value={field.value}
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
              {!form.formState.isSubmitting && "Submit"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTier;
