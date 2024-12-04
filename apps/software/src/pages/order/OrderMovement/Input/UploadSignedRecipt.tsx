import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import Spinner from "@/components/ui/Spinner";
import request from "@/lib/request";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React from "react";
import FileUpload from "@/components/Inputs/FileUpload";
import axios from "axios";
import { toast } from "sonner";
import { createPutSignedURLOrderMovementReciptType } from "@type/api/order";
import { Button } from "@/components/ui/button";
import { useSetRecoilState } from "recoil";
import { viewOrderMovementIdAtom } from "@/store/order";

const UploadSignedRecipt = ({
  order_movement_id,
  children,
}: {
  order_movement_id: number;
  children: React.ReactNode;
}) => {
  const [uploadValue, setUploadValue] = React.useState<number | null>(null);
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const FileInputRef = React.useRef<HTMLInputElement>(null);
  const setViewOrderMovement = useSetRecoilState(viewOrderMovementIdAtom);

  const form = useForm<
    z.infer<typeof createPutSignedURLOrderMovementReciptType>
  >({
    resolver: zodResolver(createPutSignedURLOrderMovementReciptType),
    reValidateMode: "onChange",
    defaultValues: {
      order_movement_id: order_movement_id,
      file_name: "",
      extension: "",
    },
  });

  const [fileName, extension] = form.watch(["file_name", "extension"]);

  async function onSubmit(
    values: z.infer<typeof createPutSignedURLOrderMovementReciptType>
  ) {
    try {
      const res = await request.post(
        "/order/createPutSignedURLOrderMovementRecipt",
        values
      );
      if (res.status == 200) {
        form.reset();
        await uploadFile(res.data.data);
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

      const res = await axios.put(url, file, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent?.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent?.total
            );
            setUploadValue(percentCompleted);
          }
        },
      });
      if(res.status == 200){
        if (FileInputRef.current) {
          FileInputRef.current.value = "";
        }
        setImageSrc(null);
        toast.success("File uploaded successfully");
        form.reset();
        setViewOrderMovement(null);
      }
    } catch (error) {
      toast.error("Error while uploading file!");
    } finally {
      setUploadValue(null);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Recipt For this Movement</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            {imageSrc && (<img src={imageSrc} className="mx-auto"/>)}
            <FileUpload
              id="ResourceFileUpload"
              ref={FileInputRef}
              onlyImages
              onChange={(fileName, ext) => {
                form.setValue("file_name", fileName);
                form.setValue("extension", ext);
                form.trigger();

                const file = FileInputRef.current?.files?.[0]
                if (file) {            
                  if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setImageSrc(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImageSrc(null);
                  }
                }
              }}
              fileName={
                fileName && extension ? `${fileName}.${extension}` : undefined
              }
            />
            <Button
              className="w-full"
              variant={"outline"}
              disabled={form.formState.isSubmitting || uploadValue !== null}
              type="submit"
            >
              {form.formState.isSubmitting && !uploadValue && <Spinner />}
              {uploadValue && (
                <Progress value={uploadValue} className="w-full" />
              )}
              {!form.formState.isSubmitting &&
                !uploadValue &&
                "Upload Resource"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSignedRecipt;
