import { Skeleton } from "@/components/ui/skeleton";
import DriverTable from "./DriverTable";
import RefetchButton from "@/components/RefetchButton";
import { useAllDrivers } from "@/hooks/driver";

const AllDriverTable = () => {
  const { drivers, loading, refetchDrivers} = useAllDrivers();
  if (loading) {
    return <Skeleton className="w-full h-96 mt-4"/>
  } else {
    return (
      <div className="mt-5">
        <div className="text-3xl font-cubano mb-4 flex items-center justify-between">
          <span>All Drivers</span>
          <RefetchButton description="Refetch All Drivers" refetchFunction={refetchDrivers} className="h-8"/>
        </div>
        <DriverTable CompKey="AllDriverTable" data={drivers} />
      </div>
    );
  }
}

export default AllDriverTable