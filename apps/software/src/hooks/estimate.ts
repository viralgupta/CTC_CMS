import { useRecoilState } from "recoil";
import request from "@/lib/request";
import { allEstimateAtom, EstimateType } from "@/store/estimates";

let loading = false;
let firstTime = false;

const useAllEstimates = () => {
  const [estimates, setEstimates] = useRecoilState(allEstimateAtom);

  const fetchAllEstimates = async () => {
    loading = true;
    try {
      const res = await request("/estimate/getAllEstimate");
      if (res.status != 200) return;
      setEstimates(res.data.data as EstimateType[]);
    } catch (error) {
      console.error("Error fetching estimates:", error);
    } finally {
      loading = false;
    }
  };
  
  if (!firstTime) {
    fetchAllEstimates();
    firstTime = true;
  }
  
  const refetchEstimates = () => {
    if(loading) return;
    setEstimates([]);
    fetchAllEstimates();
  }

  return { estimates, loading, refetchEstimates };
};

export { useAllEstimates  };
