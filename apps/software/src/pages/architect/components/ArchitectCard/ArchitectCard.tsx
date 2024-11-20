import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  CircleUserRound,
  CreditCard,
  Edit2Icon,
  PhoneIcon,
  Trash2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import request from "@/lib/request";
import { useRecoilState, useSetRecoilState } from "recoil";
import React from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditArchitect from "./EditArchitect";
import {
  viewArchitectAtom,
  viewArchitectIdAtom,
  ViewArchitectType,
} from "@/store/architect";
import { settleBalanceType } from "@type/api/architect";
import ViewAllPhoneNumbers from "@/components/Inputs/PhoneInput/ViewAllPhoneNo";
import DeleteAlert from "@/components/DeleteAlert";
import SettleBalanceForm from "@/components/Inputs/SettleBalanceForm";
import LogButton from "@/components/log/LogButton";

export default function ArchitectCard({
  architect,
}: {
  architect: ViewArchitectType | null;
}) {
  if (!architect) {
    return (
      <Card className="w-full p-6">
        <Skeleton className="w-full h-40" />
      </Card>
    );
  }

  const primaryPhone = architect.phone_numbers.filter(
    (p) => p.isPrimary == true
  )[0];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2 relative">
              <Avatar>
                <AvatarImage src={architect.profileUrl ?? ""} />
                <AvatarFallback>
                  <CircleUserRound className="w-full h-full stroke-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <span>{architect.name}</span>
              <span className="absolute right-0">
                <LogButton value={{type: {"architect_id": architect.id}}}/>
              </span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                ID: {architect.id}
              </span>
            </div>
            <div className="flex space-x-2 mt-2">
              <EditArchitect>
                <Button size="sm" variant="outline">
                  <Edit2Icon className="h-4 w-4 mr-2" />
                  Edit Architect
                </Button>
              </EditArchitect>
              <DeleteAlert type="architect" viewObjectAtom={viewArchitectAtom} viewObjectIdAtom={viewArchitectIdAtom}>
                <Button size="sm" variant="outline">
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete Architect
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
                Balance
              </span>
              <p className="text-md">
                {architect.balance ? `₹${architect.balance}` : "N/A"}
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
            <div className="col-span-2">
              <ViewAllPhoneNumbers
                type="architect"
                values={architect.phone_numbers.map((pn) => {
                  return {
                    id: pn.id,
                    country_code: pn.country_code ?? undefined,
                    phone_number: pn.phone_number,
                    whatsappChatId: pn.whatsappChatId ?? undefined,
                    isPrimary: pn.isPrimary ?? undefined,
                  };
                })}
                viewObjectAtom={viewArchitectAtom}
                viewObjectIdAtom={viewArchitectIdAtom}
              >
                <Button size="sm" variant="outline" className="w-full">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  View All Phone Numbers
                </Button>
              </ViewAllPhoneNumbers>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const SettleBalance = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const setViewArchitectId = useSetRecoilState(viewArchitectIdAtom);
  const [viewArchitect, setViewArchitect] = useRecoilState(viewArchitectAtom);

  const settleArchitectBalance = async (
    values: Omit<
      Omit<z.infer<typeof settleBalanceType>, "architect_id">,
      "amount"
    > & { amount: string }
  ) => {
    const res = await request.put("/architect/settleBalance", {
      ...values,
      architect_id: viewArchitect!.id ?? undefined,
    });
    if (res.status == 200) {
      setOpen(false);
      setViewArchitect(null);
      setViewArchitectId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Settle Balance</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {viewArchitect && (
          <SettleBalanceForm
            onSubmit={settleArchitectBalance}
            existingBalance={viewArchitect.balance ?? "0"}
          />
        )}
        {!viewArchitect && (
          <div className="w-full h-40 flex items-center justify-center">
            Unable to find architect to edit balance!!!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
