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
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { phone_numberType } from "@type/api/miscellaneous";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
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
import { Check, X, Trash2 } from "lucide-react";
import { useRecoilValue } from "recoil";
import { WhatsappConnectedAtom } from "@/store/whatsapp";
import { toast } from "sonner";
import React from "react";
import { FakeButton } from "@/components/ui/fake-button";
import { viewCustomerType } from "@/store/customer";

const PhoneNumberArray = z.array(phone_numberType.extend({
  id: z.number().optional()
}));

type PhoneNumberInputProps = {
  value: z.infer<typeof PhoneNumberArray>
  OnProfileURLChange?: (value: string) => void;
  AddNumber: (data: z.infer<typeof phone_numberType>) => void;
  removeNumber?: (value: string) => void;
  deleteNumber?: ({ children, phone }: {
    children: React.ReactNode;
    phone: viewCustomerType["phone_numbers"][number];
  }) => JSX.Element
  children?: React.ReactNode
};

const PhoneNumberInput = ({
  AddNumber,
  value,
  OnProfileURLChange,
  removeNumber,
  deleteNumber,
  children
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
      if (data.ProfileUrl && OnProfileURLChange) {
        OnProfileURLChange(data.ProfileUrl);
      }
      form.handleSubmit(onSubmit)();
    } else {
      toast.warning("Whatsapp Verification Failed!");
    }
  };

  async function onSubmit(values: z.infer<typeof phone_numberType>) {
    AddNumber(values);
    form.reset();
    setWhatSappVerificationStatus({
      verified: false,
      message: "",
    });
    return;
  }

  const VerifyContactButton = () => {
    const WhatsappLoggedIn = useRecoilValue(WhatsappConnectedAtom);
    if (!WhatsappLoggedIn) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FakeButton variant={"outline"} disabled>Verify Contact</FakeButton>
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
              <TooltipTrigger>
                <FakeButton variant={"outline"} disabled>Verify Contact</FakeButton>
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
            variant={"outline"}
            disabled={whatsappVerifying}
            className="border-primary"
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
      <DialogTrigger className="w-full" asChild={children ? true : false}>
        {!children ? <Input
          placeholder={
            value.length > 0
              ? [
                  value.find((v) => v.isPrimary)!.phone_number,
                  ...value
                    .filter((v) => !v.isPrimary)
                    .map((v) => v.phone_number),
                ].join(", ")
              : "Enter Phone Number..."
          }
        /> : children}
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
            <Button disabled={form.formState.isSubmitting} onClick={() => {form.handleSubmit(onSubmit)();}} type="button">
              {form.formState.isSubmitting && <Spinner />}
              {!form.formState.isSubmitting && "Submit"}
            </Button>
            </div>
          </form>
        </Form>
        <PhoneNumberTable value={value.map((phone) => {return {...phone, id: phone.id ? phone.id : 0}})} action={{
          message: "Delete",
          Icon: Trash2,
          fun: removeNumber,
          Element: deleteNumber
        }}/>
      </DialogContent>
    </Dialog>
  );
};

export const PhoneNumberTable = ({
  value,
  action,
  action2,
}: {
  value: viewCustomerType["phone_numbers"];
  action?: {
    message: string;
    Icon: any;
    Element?: ({
      children,
      phone,
    }: {
      children: React.ReactNode;
      phone: viewCustomerType["phone_numbers"][number];
    }) => JSX.Element;
    fun?: (phone: string) => void;
  };
  action2?: {
    message: string;
    Icon: any;
    Element?: ({
      children,
      phone,
    }: {
      children: React.ReactNode;
      phone: viewCustomerType["phone_numbers"][number];
    }) => JSX.Element;
    fun?: (phone: string) => void;
  };
}) => {
  return (
    <Table>
      <TableCaption>
        {!value ? "No Phone Number Added!" : "A list of added phone numbers."}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-min text-center">Country Code</TableHead>
          <TableHead className="w-min text-center">Phone Number</TableHead>
          <TableHead className="w-min text-center">Whatsapp Verified</TableHead>
          <TableHead className="w-min text-center">Primary</TableHead>
          {action2 && (
            <TableHead className="w-min text-center">
              {action2.message}
            </TableHead>
          )}
          {action && (
            <TableHead className="w-min text-center">
              {action.message}
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {!!value &&
          value.map((v) => {
            return (
              <TableRow key={v.id}>
                <TableCell className="font-medium text-center">
                  {v.country_code}
                </TableCell>
                <TableCell className="text-center">{v.phone_number}</TableCell>
                <TableCell>
                  {v.whatsappChatId ? (
                    <Check className="mx-auto" />
                  ) : (
                    <X className="mx-auto" />
                  )}
                </TableCell>
                <TableCell>
                  {v.isPrimary ? (
                    <Check className="mx-auto stroke-primary" />
                  ) : (
                    <X className="mx-auto" />
                  )}
                </TableCell>
                {action2 && (
                  <TableCell>
                    {action2.Element ? (
                      <action2.Element phone={v}>
                        <Button size={"icon"}>
                          <action2.Icon />
                        </Button>
                      </action2.Element>
                    ) : (
                      <Button onClick={() => { if(action2.fun) action2.fun(v.phone_number) }} size={"icon"}>
                        <action2.Icon />
                      </Button>
                    )}
                  </TableCell>
                )}
                {action && (
                  <TableCell>
                    {action.Element ? (
                      <action.Element phone={v}>
                        <Button size={"icon"}>
                          <action.Icon />
                        </Button>
                      </action.Element>
                    ) : (
                      <Button onClick={() => { if(action.fun) action.fun(v.phone_number) }} size={"icon"}>
                        <action.Icon />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
};

export default PhoneNumberInput;
