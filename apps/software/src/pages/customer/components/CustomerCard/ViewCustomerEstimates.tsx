import { viewCustomerAtom, viewCustomerType } from "@/store/Customer";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { parseDateToString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { viewEstimateIdAtom } from "@/store/estimates";

const ViewCustomerEstimates = ({children}: {children: React.ReactNode}) => {
  const viewCustomer = useRecoilValue(viewCustomerAtom);

  if (!viewCustomer) return <Skeleton className="w-full h-48"/>;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Customer Estimates</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <CustomerEstimateTable estimates={viewCustomer.estimates}/>
      </DialogContent>
    </Dialog>
  );
};

const CustomerEstimateTable = ({ estimates }: { estimates: viewCustomerType["estimates"] | null}) => {
  const setViewEstimateId = useSetRecoilState(viewEstimateIdAtom);
  return (
    <Table>
      <TableCaption>A list of customer's recent estimates.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="">Total Amount</TableHead>
          <TableHead className="">Create At</TableHead>
          <TableHead className="">Updated At</TableHead>
          <TableHead className="">View</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {estimates &&
          estimates.map((estimate) => {
            return (
              <TableRow key={estimate.id}>
                <TableCell className="">
                  {estimate.total_estimate_amount}
                </TableCell>
                <TableCell className="">
                  {parseDateToString(estimate.created_at)}
                </TableCell>
                <TableCell className="">
                  {parseDateToString(estimate.updated_at)}
                </TableCell>
                <TableCell className="">
                  <Button size={"sm"} onClick={() => {setViewEstimateId(estimate.id)}}>
                    View Estimate
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}

export default ViewCustomerEstimates