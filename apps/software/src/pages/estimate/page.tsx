import { useAllEstimates } from "@/hooks/estimate";
import CreateEstimate from "./components/CreateEstimate";
import EstimateTable from "./components/EstimateTable";
import RefetchButton from "@/components/RefetchButton";

const Estimate = () => {
  const { refetchEstimates } = useAllEstimates();
  return (
    <div className="w-full h-full flex flex-col">
      <CreateEstimate />
      <div className="w-full flex-1 flex flex-col">
        <div className="text-3xl font-cubano mb-4 flex justify-between items-center flex-none">
          All Estimates
          <RefetchButton className="h-8 w-8" refetchFunction={refetchEstimates} description="Refetch All Estimates"/>
        </div>
        <EstimateTable />
      </div>
    </div>
  );
};

export default Estimate;
