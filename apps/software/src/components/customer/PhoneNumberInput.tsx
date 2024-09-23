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
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { phone_numberType } from "../../../../../packages/types/api/miscellaneous";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import Spinner from "../ui/Spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Trash2 } from "lucide-react"
import { useRecoilValue } from "recoil";
import { WhatsappConnectedAtom } from "@/store/whatsapp";
import { toast } from "sonner";
import React from "react";

const PhoneNumberArray = z.array(phone_numberType);

type PhoneNumberInputProps = {
  onChange: (data: z.infer<typeof phone_numberType>) => void;
  value: z.infer<typeof PhoneNumberArray>;
  OnProfileURLChange: (value: string) => void;
  removeNumber: (value: string) => void;
};

const PhoneNumberInput = ({
  onChange,
  value,
  OnProfileURLChange,
  removeNumber
}: PhoneNumberInputProps) => {
  const [whatSappVerificationStatus, setWhatSappVerificationStatus] =
    React.useState<{
      verified: boolean;
      message: string;
    }>({
      verified: false,
      message: "",
    });
  const [whatsappVerifying, setWhatsappVerifying] = React.useState(false);

  const form = useForm<z.infer<typeof phone_numberType>>({
    resolver: zodResolver(phone_numberType),
    reValidateMode: "onChange",
    defaultValues: {
      country_code: "91",
      phone_number: "",
      isPrimary: value.length > 0 ? false : true,
    },
  });

  const handleVerifyWhatsapp = async () => {
    const CC = form.getValues("country_code");
    const phone_no = form.getValues("phone_number");

    if (!CC || !phone_no)
      return toast.error(
        "Country Code and Phone Number are required to verify"
      );
    if (phone_no.length !== 10)
      return toast.error("Phone Number should be of length 10");

    setWhatsappVerifying(true);
    const data = await window.ipcRenderer.invoke("get-whatsapp-info", {
      country_code: CC,
      phone_number: phone_no,
    });
    setWhatsappVerifying(false);

    if (data.WID) {
      setWhatSappVerificationStatus({
        verified: true,
        message: "Phone Number Already Verified!",
      });
      form.setValue("whatsappChatId", data.WID);
      toast.success("Whatsapp Verified!");
      if (data.ProfileUrl) {
        OnProfileURLChange(data.ProfileUrl);
      }
    } else {
      toast.warning("Whatsapp Verification Failed!");
    }
  };

  async function onSubmit(values: z.infer<typeof phone_numberType>) {
    onChange(values);
    form.reset();
    setWhatSappVerificationStatus({
      verified: false,
      message: ""
    })
    return;
  }

  const VerifyContactButton = () => {
    const WhatsappLoggedIn = useRecoilValue(WhatsappConnectedAtom);
    if (!WhatsappLoggedIn) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-default inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 opacity-50 bg-primary text-primary-foreground h-10 px-4 py-2">
              <span>Verify Contact</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Whatsapp Not Logged In!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else {
      if (whatSappVerificationStatus.verified) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-default inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 opacity-50 bg-primary text-primary-foreground h-10 px-4 py-2">
                <span>Verify Contact</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{whatSappVerificationStatus.message}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } else {
        return (
          <Button
            onClick={handleVerifyWhatsapp}
            type="button"
            disabled={whatsappVerifying}
          >
            {whatsappVerifying && <Spinner />}
            {!whatsappVerifying && "Verify Contact"}
          </Button>
        );
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Input placeholder={value.length > 0 ? value.filter((v) => v.isPrimary == true)[0].phone_number : "Enter Phone Number..."} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a phone number</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row-reverse">
            <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem className="w-3/4">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem className="w-1/4">
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full justify-between gap-2 flex-row items-center">
              <VerifyContactButton />
              <FormField
                control={form.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                    <FormLabel>Is Primary</FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
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
        <br />
        <Table>
          <TableCaption>{!value ? "No Phone Number Added!" : "A list of added phone numbers."}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-min text-center">Country Code</TableHead>
              <TableHead className="w-min text-center">Phone Number</TableHead>
              <TableHead className="w-min text-center">Whatsapp Verified</TableHead>
              <TableHead className="w-min text-center">Primary</TableHead>
              <TableHead className="w-min text-center">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!!value && value.map((v, index) => {
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium text-center">{v.country_code}</TableCell>
                  <TableCell className="text-center">{v.phone_number}</TableCell>
                  <TableCell>{v.whatsappChatId ? <Check className="mx-auto"/> : <X className="mx-auto"/>}</TableCell>
                  <TableCell>{v.isPrimary ? <Check className="mx-auto stroke-primary"/> : <X className="mx-auto"/>}</TableCell>
                  <TableCell><Button size={"icon"} onClick={() => removeNumber(v.phone_number)}><Trash2/></Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog> 
  );
};

export default PhoneNumberInput;
