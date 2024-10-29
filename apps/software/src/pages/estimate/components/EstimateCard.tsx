import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUserRound, Printer, Trash2 } from "lucide-react";
import DivButton from "@/components/ui/div-button";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { viewCustomerIDAtom } from "@/store/Customer";
import EditEstimate from "./EditEstimate";
import {
  viewEstimateAtom,
  viewEstimateIdAtom,
  ViewEstimateType,
} from "@/store/estimates";
import { parseDateToString } from "@/lib/utils";
import DeleteAlert from "@/components/DeleteAlert";
import { Button } from "@/components/ui/button";
import { useAllEstimates } from "@/hooks/estimate";
import printInfoAtom from "@/store/print";
import { toast } from "sonner";

const EstimateCard = ({ estimate }: { estimate: ViewEstimateType | null }) => {
  const setViewCustomerID = useSetRecoilState(viewCustomerIDAtom);
  const setPrintInfo = useSetRecoilState(printInfoAtom);
  const viewEstimate = useRecoilValue(viewEstimateAtom);
  const { refetchEstimates } = useAllEstimates();

  const setPrintEstimateInfo = (estimate: ViewEstimateType | null) => {
    if(!estimate) {
      toast.info("No info provided to set for print!");
      return;
    };
    setPrintInfo({
      printType: "estimate",
      customerName: estimate.customer.name,
      date: parseDateToString(estimate.created_at),
      estimate_items: estimate.estimate_items.map((item) => {
        return {
          name: item.item.name,
          quantity: item.quantity.toString(),
          rate: `${item.rate} per ${item.item.rate_dimension}`,
          total: item.total_value
        }
      }),
      totalEstimateCost: estimate.total_estimate_amount
    })
  }

  if (!estimate) return <Skeleton className="w-full h-96" />;
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="text-2xl font-bold mb-4 flex justify-between">
          Estimate Details
        </div>
        <div className="flex gap-2 mb-2">
          <DivButton
            onClick={() => {
              setViewCustomerID(estimate.customer_id ?? "");
            }}
            className="flex items-center space-x-4 w-1/2 px-2 py-1"
          >
            <Avatar>
              <AvatarImage src={estimate.customer?.profileUrl ?? undefined} />
              <AvatarFallback>
                <CircleUserRound className="w-10 h-10 stroke-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {estimate.customer?.name ?? "No Customer Assigned"}
              </p>
              {estimate.customer && (
                <p className="text-sm text-muted-foreground">
                  {estimate.customer?.phone_numbers[0].country_code}&nbsp;
                  {estimate.customer?.phone_numbers[0].phone_number}
                </p>
              )}
              {estimate.customer && (
                <p className="text-sm">
                  Balance: ₹{estimate.customer?.balance ?? "0.00"}
                </p>
              )}
            </div>
          </DivButton>
          <DivButton className="flex flex-col w-1/2 px-2 hover:bg-background cursor-default">
            <div className="text-xl font-sofiapro">
              Total Estimate Amount: ₹{estimate.total_estimate_amount}
            </div>
            <div className="font-sofiapro text-foreground/70">
              Created At: {parseDateToString(estimate.created_at)}
            </div>
            <div className="font-sofiapro text-foreground/70">
              Updated At: {parseDateToString(estimate.updated_at)}
            </div>
          </DivButton>
        </div>
        <div className="gap-2 flex w-full">
          <EditEstimate />
          <DeleteAlert
            refetchFunction={refetchEstimates}
            type="estimate"
            viewObjectAtom={viewEstimateAtom}
            viewObjectIdAtom={viewEstimateIdAtom}
          >
            <Button variant={"outline"} className="gap-2 w-full">
              <Trash2 />
              Delete Estimate
            </Button>
          </DeleteAlert>
          <Button variant={"outline"} onClick={() => setPrintEstimateInfo(viewEstimate)} className="w-full gap-2">
            <Printer />
            Print Estimate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateCard;
