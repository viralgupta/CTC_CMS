import { Skeleton } from "@/components/ui/skeleton";
import CarpenterTable from "./CarpanterTable";
import RefetchButton from "@/components/RefetchButton";
import { useAllCarpenter } from "@/hooks/carpenter";
import LogButton from "@/components/log/logButton";

const AllCarpenterTable = () => {
  const { carpenters, loading, refetchCarpenters} = useAllCarpenter();
  if (loading) {
    return <Skeleton className="w-full h-96 mt-4"/>
  } else {
    return (
      <div className="mt-5">
        <div className="text-3xl font-cubano mb-4 flex items-center justify-between">
          <span>All Carpenters</span>
          <div className="flex gap-2">
            <RefetchButton description="Refetch All Carpenters" refetchFunction={refetchCarpenters} className="h-8"/>
            <LogButton value={{linked_to: "CARPANTER"}}/>
          </div>
        </div>
        <CarpenterTable CompKey="AllCarpenterTable" data={carpenters} />
      </div>
    );
  }
}

export default AllCarpenterTable