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
import EditCarpenter from "./EditCarpenter";
import {
  viewCarpenterAtom,
  viewCarpenterIdAtom,
  ViewCarpenterType,
} from "@/store/carpenter";
import { useAllCarpenter } from "@/hooks/carpenter";
import { settleBalanceType } from "@type/api/architect";
import ViewAllPhoneNumbers from "@/components/Inputs/PhoneInput/ViewAllPhoneNo";
import DeleteAlert from "@/components/DeleteAlert";
import SettleBalanceForm from "@/components/Inputs/SettleBalanceForm";

export default function CarpenterCard({
  carpenter,
}: {
  carpenter: ViewCarpenterType | null;
}) {
  const { refetchCarpenters } = useAllCarpenter();
  if (!carpenter) {
    return (
      <Card className="w-full p-6">
        <Skeleton className="w-full h-40" />
      </Card>
    );
  }

  const primaryPhone = carpenter.phone_numbers.filter(
    (p) => p.isPrimary == true
  )[0];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={carpenter.profileUrl ?? ""} />
                <AvatarFallback>
                  <CircleUserRound className="w-full h-full stroke-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <span>{carpenter.name}</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                ID: {carpenter.id}
              </span>
            </div>
            <div className="flex space-x-2 mt-2">
              <EditCarpenter>
                <Button size="sm" variant="outline">
                  <Edit2Icon className="h-4 w-4 mr-2" />
                  Edit Carpenter
                </Button>
              </EditCarpenter>
              <DeleteAlert type="carpanter" refetchFunction={refetchCarpenters} viewObjectAtom={viewCarpenterAtom} viewObjectIdAtom={viewCarpenterIdAtom}>
                <Button size="sm" variant="outline">
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete Carpenter
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
                {carpenter.balance ? `₹${carpenter.balance}` : "N/A"}
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
                type="carpanter"
                values={carpenter.phone_numbers.map((pn) => {
                  return {
                    id: pn.id,
                    country_code: pn.country_code ?? undefined,
                    phone_number: pn.phone_number,
                    whatsappChatId: pn.whatsappChatId ?? undefined,
                    isPrimary: pn.isPrimary ?? undefined,
                  };
                })}
                viewObjectAtom={viewCarpenterAtom}
                viewObjectIdAtom={viewCarpenterIdAtom}
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
  const { refetchCarpenters } = useAllCarpenter();
  const setViewCarpenterId = useSetRecoilState(viewCarpenterIdAtom);
  const [viewCarpenter, setViewCarpenter] = useRecoilState(viewCarpenterAtom);

  const settleCarpenterBalance = async (
    values: Omit<
      Omit<z.infer<typeof settleBalanceType>, "architect_id">,
      "amount"
    > & { amount: string }
  ) => {
    const res = await request.put("/carpenter/settleBalance", {
      ...values,
      carpanter_id: viewCarpenter!.id ?? undefined,
    });
    if (res.status == 200) {
      setOpen(false);
      refetchCarpenters();
      setViewCarpenter(null);
      setViewCarpenterId(null);
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
        {viewCarpenter && (
          <SettleBalanceForm
            onSubmit={settleCarpenterBalance}
            existingBalance={viewCarpenter.balance ?? "0"}
          />
        )}
        {!viewCarpenter && (
          <div className="w-full h-40 flex items-center justify-center">
            Unable to find carpenter to edit balance!!!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};