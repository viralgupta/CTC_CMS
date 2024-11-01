import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import { useSetRecoilState } from "recoil";
import DataTable from "../../../components/DataTable";
import { parseDateToString } from "@/lib/utils";
import { EstimateType, viewEstimateIdAtom } from "@/store/estimates";
import { useAllEstimates } from "@/hooks/estimate";
import { Skeleton } from "@/components/ui/skeleton";

function EstimateTable() {
  const { estimates , loading} = useAllEstimates();
  const setViewEstimateIdAtom = useSetRecoilState(viewEstimateIdAtom);

  const columns: ColumnDef<EstimateType>[] = [
    {
      id: "customer_name",
      accessorFn: (row) => {
        return `${row.customer?.name ?? "--"}`;
      },
      header: "Customer Name",
    },
    {
      id: "total_estimate_amount",
      accessorKey: "total_estimate_amount",
      header: "Total Estimate Amount",
    },
    {
      id: "updated_at",
      accessorFn: (or) => {
        return parseDateToString(or.updated_at);
      },
      header: "Updated At",
    },
    {
      id: "actions",
      enableHiding: false,
      meta: {
        align: "right",
      },
      cell: ({ row }) => {
        const estimateId = row.original.id;
        return (
          <Button
            size={"sm"}
            variant="outline"
            className="px-2"
            onClick={() => {
              setViewEstimateIdAtom(estimateId);
            }}
          >
            View Estimate
          </Button>
        );
      },
    },
  ];

  return (
    <div className="w-full h-full">
      {!loading ? <DataTable
        data={estimates}
        key={"AllEsimtateTable"}
        columns={columns}
        columnFilters={[]}
        defaultColumn={{
          meta: {
            headerStyle: {
              textAlign: "center",
            },
            align: "center",
          },
        }}
        columnVisibility={{
          id: false,
        }}
        message="No estimates found!"
      /> : <Skeleton className="w-full h-svh"/>}
    </div>
  );
}

export default EstimateTable;
