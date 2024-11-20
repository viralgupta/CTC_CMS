import { viewCustomerAtom, viewCustomerType } from "@/store/customer";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { parseDateToString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { viewEstimateIdAtom } from "@/store/estimates";
import { useVirtualizer } from "@tanstack/react-virtual";

const ViewCustomerEstimates = ({ children }: { children: React.ReactNode }) => {
  const viewCustomer = useRecoilValue(viewCustomerAtom);
  const setViewEstimateId = useSetRecoilState(viewEstimateIdAtom);
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: (viewCustomer?.estimates ?? []).length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 2,
  });

  if (!viewCustomer) return <Skeleton className="w-full h-48" />;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="xl"
        ref={parentRef}
        className="max-h-96 overflow-y-auto hide-scroll"
      >
        <DialogHeader>
          <DialogTitle>Customer Estimates</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
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
            {viewCustomer.estimates &&
              virtualizer.getVirtualItems().map((virtualRow, index) => {
                const estimate = viewCustomer.estimates[virtualRow.index];
                return (
                  <TableRow key={estimate.id}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${
                        virtualRow.start - index * virtualRow.size
                      }px)`,
                    }}
                  >
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
                      <Button
                        size={"sm"}
                        onClick={() => {
                          setViewEstimateId(estimate.id);
                        }}
                      >
                        View Estimate
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCustomerEstimates;