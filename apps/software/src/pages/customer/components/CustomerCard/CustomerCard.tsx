import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  CircleUserRound,
  CreditCard,
  Edit2Icon,
  FileTextIcon,
  MapPinIcon,
  PhoneIcon,
  Trash2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import request from "@/lib/request";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  viewCustomerAtom,
  viewCustomerIDAtom,
  viewCustomerType,
} from "@/store/customer";
import React from "react";
import { z } from "zod";
import { settleBalanceType } from "@type/api/architect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import ViewAllAddresses from "./ViewAllAddresses";
import EditCustomer from "./EditCustomer";
import ViewCustomerEstimates from "./ViewCustomerEstimates";
import ViewAllPhoneNumbers from "@/components/Inputs/PhoneInput/ViewAllPhoneNo";
import DeleteAlert from "@/components/DeleteAlert";
import SettleBalanceForm from "@/components/Inputs/SettleBalanceForm";
import LogButton from "@/components/log/LogButton";

export default function CustomerCard({
  customer,
}: {
  customer: viewCustomerType | null;
}) {
  if (!customer) {
    return (
      <Card className="w-full p-6">
        <Skeleton className="w-full h-40" />
      </Card>
    );
  }

  const primaryPhone = customer.phone_numbers.filter(
    (p) => p.isPrimary == true
  )[0];
  const primaryAddress = customer.addresses.filter(
    (a) => a.isPrimary == true
  )[0];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2 relative">
              <Avatar>
                <AvatarImage src={customer.profileUrl ?? ""} />
                <AvatarFallback>
                  <CircleUserRound className="w-full h-full stroke-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <span>{customer.name}</span>
              <span className="absolute right-0">
                <LogButton value={{type: {"customer_id": customer.id}}}/>
              </span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                ID: {customer.id}
              </span>
            </div>
            <div className="flex space-x-2 mt-2">
              <EditCustomer>
                <Button size="sm" variant="outline">
                  <Edit2Icon className="h-4 w-4 mr-2" />
                  Edit Customer
                </Button>
              </EditCustomer>
              <DeleteAlert type="customer" viewObjectAtom={viewCustomerAtom} viewObjectIdAtom={viewCustomerIDAtom}>
                <Button size="sm" variant="outline">
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete Customer
                </Button>
              </DeleteAlert>
              <SettleBalance>
                <Button size="sm" variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Settle Balance
                </Button>
              </SettleBalance>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Priority
              </span>
              <p
                className={`text-sm uppercase ${customer.priority == "High" ? "text-red-500" : customer.priority == "Mid" ? "text-yellow-300" : "text-foreground"}`}
              >
                {customer.priority || "Not set"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Balance
              </span>
              <p className="text-md">
                {customer.balance ? `₹${customer.balance}` : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Primary Phone
              </span>
              <p className="text-md">
                {primaryPhone
                  ? `+${primaryPhone.country_code || ""} ${primaryPhone.phone_number}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Primary Address
              </span>
              <p className="text-md">
                {primaryAddress
                  ? `${primaryAddress.house_number}, ${primaryAddress.address}, ${primaryAddress.address_area.area}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-around space-x-2 mt-2">
          <ViewAllPhoneNumbers type="customer" values={customer.phone_numbers} viewObjectAtom={viewCustomerAtom} viewObjectIdAtom={viewCustomerIDAtom}>
            <Button size="sm" variant="outline" className="w-full">
              <PhoneIcon className="h-4 w-4 mr-2" />
              View All Phone Numbers
            </Button>
          </ViewAllPhoneNumbers>
          <ViewAllAddresses customer_id={customer.id} values={customer.addresses}>
            <Button size="sm" variant="outline" className="w-full">
              <MapPinIcon className="h-4 w-4 mr-2" />
              View All Addresses
            </Button>
          </ViewAllAddresses>
          <ViewCustomerEstimates>
            <Button size="sm" variant="outline" className="w-full">
              <FileTextIcon className="h-4 w-4 mr-2" />
              View All Estimates
            </Button>
          </ViewCustomerEstimates>
        </div>
      </CardContent>
    </Card>
  );
}


const SettleBalance = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  const setViewCustomerId = useSetRecoilState(viewCustomerIDAtom);
  const [viewCustomer, setViewCustomer] = useRecoilState(viewCustomerAtom);

  const settleCustomerBalance = async (values: Omit<Omit<z.infer<typeof settleBalanceType>, "architect_id">, "amount"> & { amount: string }) => {
    const res = await request.put("/customer/settleBalance", {
      ...values,
      customer_id: viewCustomer!.id ?? undefined,
    });
    if (res.status == 200) {
      setOpen(false);
      setViewCustomer(null);
      setViewCustomerId(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Settle Balance</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {viewCustomer && <SettleBalanceForm onSubmit={settleCustomerBalance} existingBalance={viewCustomer.balance ?? "0"}/>}
        {!viewCustomer && (
          <div className="w-full h-40 flex items-center justify-center">
            Unable to find customer to edit balance!!!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};