import { Button } from "@/components/ui/button";
import request from "@/lib/request";
import { useRecoilState, useSetRecoilState } from "recoil";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/Spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import ProfileUrlInput from "@/components/Inputs/PhoneInput/ProfileUrlInput";
import { viewCarpenterAtom, viewCarpenterIdAtom } from "@/store/carpenter";
import { editCarpenterType } from "@type/api/carpenter";
import SelectTier from "@/components/Inputs/SelectTier";

const EditCarpenter = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const [viewCarpenter, setViewCarpenter] = useRecoilState(viewCarpenterAtom);
  const setViewCarpenterID = useSetRecoilState(viewCarpenterIdAtom);

  const EditCarpenterForm = () => {
    const form = useForm<z.infer<typeof editCarpenterType>>({
      resolver: zodResolver(editCarpenterType),
      reValidateMode: "onChange",
      defaultValues: {
        carpenter_id: viewCarpenter?.id,
        name: viewCarpenter?.name,
        profileUrl: viewCarpenter?.profileUrl ?? undefined,
        area: viewCarpenter?.area ?? undefined,
        tier_id: viewCarpenter?.tier_id,
      },
    });

    async function onSubmit(values: z.infer<typeof editCarpenterType>) {
      const res = await request.put("/carpenter/editCarpenter", values);
      if (res.status == 200) setOpen(false);
      setViewCarpenterID(null);
      setViewCarpenter(null);
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex w-full flex-row justify-around">
            <FormField
              control={form.control}
              name="profileUrl"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center w-1/2">
                  <FormLabel>Profile Url</FormLabel>
                  <FormControl>
                    <ProfileUrlInput
                      value={field.value}
                      removePhoto={() => {
                        form.setValue("profileUrl", "");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full mr-2">
                  <FormLabel>Carpenter Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tier_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Tier</FormLabel>
                  <FormControl>
                    <SelectTier defaultValue={field.value} onValueChange={field.onChange}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting && <Spinner />}
            {!form.formState.isSubmitting && "Edit Carpenter"}
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
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Edit Carpenter</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {viewCarpenter && <EditCarpenterForm />}
        {!viewCarpenter && (
          <div className="w-full h-40 flex items-center justify-center">
            Unable to find carpenter to edit!!!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditCarpenter;