import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRecoilState } from "recoil";
import React from "react";
import printInfoAtom from "@/store/print";
import { Button } from "@/components/ui/button";
import Spinner from "./ui/Spinner";
import { z } from "zod";
import { Input } from "./ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const printConfirmType = z.object({
  color: z.boolean(),
  copies: z.number().positive(),
  pageSize: z.enum([
    "A0",
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "A6",
    "Legal",
    "Letter",
    "Tabloid",
  ]),
  printer_name: z.string(),
});

const ViewPrintOptions = () => {
  const [printInfo, setPrintInfo] = useRecoilState(printInfoAtom);
  const [availablePrinters, setAvailablePrinters] = React.useState<
    { name: string; status: number }[]
  >([]);

  
  const form = useForm<z.infer<typeof printConfirmType>>({
    resolver: zodResolver(printConfirmType),
    reValidateMode: "onChange",
    defaultValues: {
      color: false,
      copies: 1,
      pageSize: "A6",
    }
  });
  
  async function onSubmit(values: z.infer<typeof printConfirmType>) {
    await window.ipcRenderer.invoke("confirm-print", values.color, values.copies, values.pageSize, values.printer_name)
  }

  function fetchPrinters() {
    window.ipcRenderer
      .invoke("available-printers")
      .then((info) => setAvailablePrinters(info));  
  }
  
  React.useEffect(() => {
    if (printInfo) {
      fetchPrinters();
      return;
    }
  }, [printInfo]);

  return (
    <Dialog
      open={printInfo ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setPrintInfo(null);
          return;
        }
      }}
    >
      <DialogContent size="2xl">
        <DialogHeader className="hidden">
          <DialogDescription>Print Options</DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex w-full flex-row justify-around gap-2">
              <FormField
                control={form.control}
                name="printer_name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Printer</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full" onMouseEnter={fetchPrinters}>
                          <SelectValue placeholder="Select Printer" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePrinters.map((printer) => (
                            <SelectItem value={printer.name} key={printer.name} className="flex justify-between">
                              <div>{printer.name}</div>
                              {printer.status === 0 && <div className="text-red-500">Low paper supply</div>}
                              {printer.status === 1 && <div className="text-red-500">No paper available</div>}
                              {printer.status === 2 && <div className="text-red-500">Low toner supply</div>}
                              {printer.status === 3 && <div className="text-red-500">No toner available</div>}
                              {printer.status === 4 && <div className="text-red-500">A printer door is open</div>}
                              {printer.status === 5 && <div className="text-red-500">The printer is jammed</div>}
                              {printer.status === 6 && <div className="text-red-500">The printer is offline</div>}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="copies"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Copies</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full flex-row justify-around gap-2">
              <FormField
                control={form.control}
                name="pageSize"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Page Size</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Page Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A0">A0</SelectItem>
                          <SelectItem value="A1">A1</SelectItem>
                          <SelectItem value="A2">A2</SelectItem>
                          <SelectItem value="A3">A3</SelectItem>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="A5">A5</SelectItem>
                          <SelectItem value="A6">A6</SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                          <SelectItem value="Letter">Letter</SelectItem>
                          <SelectItem value="Tabloid">Tabloid</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem className="w-full flex items-end justify-around gap-2">
                    <FormLabel className="text-2xl font-serif">Color Printout</FormLabel>
                    <FormControl>
                      <Checkbox className="h-8 w-8" checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting && <Spinner />}
              {!form.formState.isSubmitting && "Confirm Printout"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ViewPrintOptions;
