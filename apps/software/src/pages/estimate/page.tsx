import { useAllEstimates } from "@/hooks/estimate";
import CreateEstimate from "./components/CreateEstimate";
import EstimateTable from "./components/EstimateTable";
import RefetchButton from "@/components/RefetchButton";

const Estimate = () => {
  const { refetchEstimates } = useAllEstimates();
  return (
    <div className="w-full h-full">
      <CreateEstimate />
      <div className="w-full h-full">
        <div className="text-3xl font-cubano mb-4 flex justify-between items-center">
          All Estimates
          <RefetchButton className="h-8 w-8" refetchFunction={refetchEstimates} description="Refetch All Estimates"/>
        </div>
        <EstimateTable />
        <div>&nbsp;</div>
        <div>&nbsp;</div>
      </div>
    </div>
  );
};

export default Estimate;
