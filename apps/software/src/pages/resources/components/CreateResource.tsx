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
import { Progress } from "@/components/ui/progress";
import Spinner from "@/components/ui/Spinner";
import request from "@/lib/request";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPutSignedURLType } from "@type/api/miscellaneous";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import FileUpload from "@/components/Inputs/FileUpload";
import axios from "axios";
import { toast } from "sonner";

const CreateResource = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="w-full mb-4 text-xl font-cubano flex-none">
          Create New Resource +
        </Button>
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Create A New Resource</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <CreateResourceForm />
      </DialogContent>
    </Dialog>
  );
};

const CreateResourceForm = () => {
  const [uploadValue, setUploadValue] = React.useState<number | null>(null);
  const FileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof createPutSignedURLType>>({
    resolver: zodResolver(createPutSignedURLType),
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      file_name: "",
      extension: "",
    },
  });

  const [fileName, Extension] = form.watch(["file_name", "extension"]);

  async function onSubmit(values: z.infer<typeof createPutSignedURLType>) {
    try {
      const res = await request.post(
        "/miscellaneous/createPutSignedURL",
        values
      );
      if (res.status == 200) {
        form.reset();
        await uploadFile(res.data.data);
        toast.success("Creation in process...")
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function uploadFile(url: string) {
    try {

      const file = FileInputRef.current?.files?.[0];
      if (!file) {
        toast.error("No file selected");
        return;
      }
      
      await axios
        .put(url, file, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent?.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent?.total
              );
              setUploadValue(percentCompleted);
            }
          },
        });
      
    } catch (error) {
      toast.error("Error uploading file");
    } finally {
      if (FileInputRef.current) {
        FileInputRef.current.value = "";
      }
      setUploadValue(null);
      form.reset()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
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
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>File Description</FormLabel>
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
        <FileUpload
          id="ResourceFileUpload"
          ref={FileInputRef}
          onChange={(file, ext) => {
            form.setValue("file_name", file);
            form.setValue("extension", ext);
            form.trigger();
          }}
          fileName={
            fileName && Extension ? `${fileName}.${Extension}` : undefined
          }
        />
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row pb-2">
          <FormField
            control={form.control}
            name="file_name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>File Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="extension"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>File Extension</FormLabel>
                <FormControl>
                  <Input type="text" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          className="w-full"
          variant={"outline"}
          disabled={form.formState.isSubmitting || uploadValue !== null}
          type="submit"
        >
          {form.formState.isSubmitting && !uploadValue && <Spinner />}
          {uploadValue && <Progress value={uploadValue} className="w-full"/>}
          {!form.formState.isSubmitting && !uploadValue && "Upload Resource"}
        </Button>
      </form>
    </Form>
  );
};

export default CreateResource;
