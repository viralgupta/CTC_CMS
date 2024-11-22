import { viewCustomerAtom, viewCustomerType } from "@/store/customer";
import { useRecoilValue, useSetRecoilState } from "recoil";
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
import DataTable from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";

const ViewCustomerEstimates = ({ children }: { children: React.ReactNode }) => {
  const viewCustomer = useRecoilValue(viewCustomerAtom);
  const setViewEstimateId = useSetRecoilState(viewEstimateIdAtom);

  if (!viewCustomer) return <Skeleton className="w-full h-48" />;

  const columns: ColumnDef<viewCustomerType["estimates"][number]>[] = [
    {
      id: "total_estimate_amount",
      accessorKey: "total_estimate_amount",
      header: "Total Amount",
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: "Date Created",
      cell: ({ row }) => {
        const createdAt = row.original.created_at;
        return parseDateToString(createdAt);
      }
    },
    {
      id: "updated_at",
      accessorKey: "updated_at",
      header: "Date Updated",
      cell: ({ row }) => {
        const updatedAt = row.original.updated_at;
        return parseDateToString(updatedAt);
      }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const estimateId = row.original.id;
        return (
          <Button
            size={"sm"}
            onClick={() => {
              setViewEstimateId(estimateId);
            }}
          >
            View Estimate
          </Button>
        );
      }
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="xl" className="max-h-96 overflow-y-auto hide-scroll flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle>Customer Estimates</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <DataTable
          data={viewCustomer.estimates}
          key={"Customer Estimates"}
          columns={columns}
          columnFilters={false}
          defaultColumn={{
            meta: {
              headerStyle: {
                textAlign: "center",
              },
            },
          }}
          message="No Customers Estimates Found!"
        />
      </DialogContent>
    </Dialog>
  );
};

export default ViewCustomerEstimates;