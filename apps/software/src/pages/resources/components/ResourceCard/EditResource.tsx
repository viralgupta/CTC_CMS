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
  DialogTrigger,
} from "@/components/ui/dialog";
import { editResourceType } from "@type/api/miscellaneous";
import { viewResourceAtom, viewResourceIdAtom } from "@/store/resources";
import { useAllResources } from "@/hooks/resources";
import { Textarea } from "@/components/ui/textarea";

const EditResource = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [viewResource, setViewResource] = useRecoilState(viewResourceAtom);
  const setViewResourceID = useSetRecoilState(viewResourceIdAtom);
  const { refetchResources } = useAllResources();

  const EditResourceForm = () => {
    const form = useForm<z.infer<typeof editResourceType>>({
      resolver: zodResolver(editResourceType),
      reValidateMode: "onChange",
      defaultValues: {
        resource_id: viewResource?.id ?? "",
        name: viewResource?.name ?? "",
        description: viewResource?.description ?? ""
      },
    });

    async function onSubmit(values: z.infer<typeof editResourceType>) {
      const res = await request.put("/miscellaneous/editResource", values);
      if (res.status == 200) setOpen(false);
      setViewResourceID(null);
      setViewResource(null);
      refetchResources();
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex w-full flex-row justify-around">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full flex-row justify-around">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="resize-none overflow-y-scroll hide-scroll w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting && <Spinner />}
            {!form.formState.isSubmitting && "Edit Driver"}
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {viewResource && <EditResourceForm />}
        {!viewResource && (
          <div className="w-full h-40 flex items-center justify-center">
            Unable to find resource to edit!!!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditResource;
