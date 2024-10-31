import { Skeleton } from "@/components/ui/skeleton";
import ArchitectTable from "./ArchitectTable";
import RefetchButton from "@/components/RefetchButton";
import { useAllArchitect } from "@/hooks/architect";
import LogButton from "@/components/log/logButton";

const AllArchitectTable = () => {
  const { architects, loading, refetchArchitects} = useAllArchitect();
  if (loading) {
    return <Skeleton className="w-full h-96 mt-4"/>
  } else {
    return (
      <div className="mt-5">
        <div className="text-3xl font-cubano mb-4 flex items-center justify-between">
          <span>All Architects</span>
          <div className="flex gap-2">
            <RefetchButton description="Refetch All Architects" refetchFunction={refetchArchitects} className="h-8"/>
            <LogButton value={{linked_to: "ARCHITECT"}}/>
          </div>
        </div>
        <ArchitectTable CompKey="AllArchitectTable" data={architects} />
      </div>
    );
  }
}

export default AllArchitectTable