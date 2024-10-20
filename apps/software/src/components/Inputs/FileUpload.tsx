import { Input } from "@/components/ui/input";
import { CloudUpload } from "lucide-react";
import React, { ChangeEvent, forwardRef } from "react";
import { toast } from "sonner";

type FileUploadProps = {
  id: string;
  onChange: (fileName: string, extension: string) => void;
  fileName?: string;
};

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ id, onChange, fileName }, ref) => {
    const [IsDragging, setIsDragging] = React.useState(false);

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
      const uploadfile = event.target?.files?.[0];
      if (!uploadfile) {
        toast.info("A file in necessary to upload!");
        return;
      }
      const extension = uploadfile.name.split(".").pop() || "";
      const fileName = uploadfile.name.slice(
        0,
        uploadfile.name.lastIndexOf(".")
      );
      onChange(fileName, extension);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 1) {
        toast.error("Only one file allowed at a time!");
      } else if (files.length == 1) {
        const droppedFile = files[0];
        
        const event = {
          target: { files: [droppedFile] },
        } as any as ChangeEvent<HTMLInputElement>;

        onFileChange(event);
      }
    };

    return (
      <label
        id="dropzone-label"
        htmlFor={id}
        className={`flex w-full cursor-default flex-col items-center justify-center rounded-lg border-2 border-dashed ${IsDragging && "border-primary"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <CloudUpload className="h-8 w-8" />
          <p className="text-sm mb-2">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          {fileName && fileName !== "." && (
            <p className="text-sm font-bold text-primary">{`FILE SELECTED: ${fileName}`}</p>
          )}
        </div>
        <Input
          ref={ref}
          id={id}
          type="file"
          className="hidden cursor-not-allowed"
          defaultValue={undefined}
          onChange={onFileChange}
        />
      </label>
    );
  }
);

export default FileUpload;
