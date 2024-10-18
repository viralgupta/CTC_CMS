import { Skeleton } from "@/components/ui/skeleton";
import CarpenterTable from "./CarpanterTable";
import RefetchButton from "@/components/RefetchButton";
import { useAllCarpenter } from "@/hooks/carpenter";

const AllCarpenterTable = () => {
  const { carpenters, loading, refetchCarpenters} = useAllCarpenter();
  if (loading) {
    return <Skeleton className="w-full h-96 mt-4"/>
  } else {
    return (
      <div className="mt-5">
        <div className="text-3xl font-cubano mb-4 flex items-center justify-between">
          <span>All Carpenters</span>
          <RefetchButton description="Refetch All Carpenters" refetchFunction={refetchCarpenters} className="h-8"/>
        </div>
        <CarpenterTable CompKey="AllCarpenterTable" data={carpenters} />
      </div>
    );
  }
}

export default AllCarpenterTable