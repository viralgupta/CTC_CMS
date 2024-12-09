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
import { viewArchitectAtom, viewArchitectIdAtom } from "@/store/architect";
import { editArchitectType } from "@type/api/architect";
import SelectTier from "@/components/Inputs/SelectTier";

const EditArchitect = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const [viewArchitect, setViewArchitect] = useRecoilState(viewArchitectAtom);
  const setViewArchitectID = useSetRecoilState(viewArchitectIdAtom);

  const EditArchitectForm = () => {
    const form = useForm<z.infer<typeof editArchitectType>>({
      resolver: zodResolver(editArchitectType),
      reValidateMode: "onChange",
      defaultValues: {
        architect_id: viewArchitect?.id,
        name: viewArchitect?.name,
        profileUrl: viewArchitect?.profileUrl ?? undefined,
        area: viewArchitect?.area ?? undefined,
        tier_id: viewArchitect?.tier_id,
      },
    });

    async function onSubmit(values: z.infer<typeof editArchitectType>) {
      const res = await request.put("/architect/editArchitect", values);
      if (res.status == 200) setOpen(false);
      setViewArchitectID(null);
      setViewArchitect(null);
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
                  <FormLabel>Architect Name</FormLabel>
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
            {!form.formState.isSubmitting && "Edit Architect"}
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
          <DialogTitle>Edit Architect</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {viewArchitect && <EditArchitectForm />}
        {!viewArchitect && (
          <div className="w-full h-40 flex items-center justify-center">
            Unable to find architect to edit!!!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditArchitect;