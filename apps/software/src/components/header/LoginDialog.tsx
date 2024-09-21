import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "../ui/Spinner";
import { signIn } from "next-auth/react";

const loginFormSchema = z.object({
  phone_number: z
    .string()
    .length(10, "Phone Number should be of 10 Characters")
    .refine((val) => {
      if (isNaN(Number(val))) {
        return false;
      } else {
        return true;
      }
    }),
  otp: z.string().length(6),
});

const LoginForm = () => {
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    reValidateMode: "onChange",
    defaultValues: {
      phone_number: import.meta.env.DEV ? "1234567890" : "",
      otp: import.meta.env.DEV ? "123123" : "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    try {
      await signIn("credentials", {
        redirect: false,
        phone_number: values.phone_number,
        otp: values.otp,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="9891388XXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OTP</FormLabel>
              <FormControl>
                <InputOTP
                  onChange={(v) => field.onChange(v)}
                  value={field.value}
                  maxLength={6}
                  containerClassName="flex justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting && <Spinner />}
          {!form.formState.isSubmitting && "Submit"}
        </Button>
      </form>
    </Form>
  );
};

const LoginDialog = ({ children, disabled }: { children: React.ReactNode, disabled: boolean }) => {
  return (
    <Dialog {...(disabled ? { open: false } : {})}>
      <DialogTrigger disabled={disabled} className={`cursor-pointer disabled:cursor-default md:block ${disabled && "hidden"}`}>
        {children}
      </DialogTrigger>
      <DialogContent aria-describedby="Admin Login Form">
        <DialogHeader>
          <DialogTitle>Login Details</DialogTitle>
        <DialogDescription className="p-0 m-0 h-0 hidden"></DialogDescription>
        </DialogHeader>
        <LoginForm />
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
