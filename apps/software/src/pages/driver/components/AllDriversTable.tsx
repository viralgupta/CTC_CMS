import { Skeleton } from "@/components/ui/skeleton";
import DriverTable from "./DriverTable";
import RefetchButton from "@/components/RefetchButton";
import { useAllDrivers } from "@/hooks/driver";
import LogButton from "@/components/log/LogButton";

const AllDriverTable = () => {
  const { drivers, loading, refetchDrivers} = useAllDrivers();
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-3xl font-cubano mb-4 flex items-center justify-between mt-5 flex-none">
        <span>All Drivers</span>
        <div className="flex gap-2">
          <RefetchButton
            description="Refetch All Drivers"
            refetchFunction={refetchDrivers}
            className="h-8"
          />
          <LogButton value={{ linked_to: "DRIVER" }} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="w-full flex-1" />
      ) : (
        <DriverTable CompKey="AllDriverTable" data={drivers} />
      )}
    </div>
  );
}

export default AllDriverTable