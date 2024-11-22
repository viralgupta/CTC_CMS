import { Skeleton } from "@/components/ui/skeleton";
import CarpenterTable from "./CarpanterTable";
import RefetchButton from "@/components/RefetchButton";
import { useAllCarpenter } from "@/hooks/carpenter";
import LogButton from "@/components/log/LogButton";

const AllCarpenterTable = () => {
  const { carpenters, loading, refetchCarpenters} = useAllCarpenter();
  return (
    <>
      <div className="text-3xl font-cubano mb-4 flex items-center justify-between mt-5 flex-none">
        <span>All Carpenters</span>
        <div className="flex gap-2">
          <RefetchButton
            description="Refetch All Carpenters"
            refetchFunction={refetchCarpenters}
            className="h-8"
          />
          <LogButton value={{ linked_to: "CARPANTER" }} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="w-full flex-1" />
      ) : (
        <CarpenterTable CompKey="AllCarpenterTable" data={carpenters} />
      )}
    </>
  );
}

export default AllCarpenterTable