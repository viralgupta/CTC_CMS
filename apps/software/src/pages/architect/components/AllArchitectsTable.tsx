import { Skeleton } from "@/components/ui/skeleton";
import ArchitectTable from "./ArchitectTable";
import RefetchButton from "@/components/RefetchButton";
import { useAllArchitect } from "@/hooks/architect";
import LogButton from "@/components/log/LogButton";

const AllArchitectTable = () => {
  const { architects, loading, refetchArchitects} = useAllArchitect();
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-3xl font-cubano mb-4 flex items-center justify-between mt-5 flex-none">
        <span>All Architects</span>
        <div className="flex gap-2">
          <RefetchButton
            description="Refetch All Architects"
            refetchFunction={refetchArchitects}
            className="h-8"
          />
          <LogButton value={{ linked_to: "ARCHITECT" }} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="w-full flex-1" />
      ) : (
        <ArchitectTable CompKey="AllArchitectTable" data={architects} />
      )}
    </div>
  );
}

export default AllArchitectTable