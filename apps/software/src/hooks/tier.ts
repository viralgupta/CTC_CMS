import { useRecoilState } from "recoil";
import request from "@/lib/request";
import { allTierAtom } from "@/store/tier";

let loading = false;
let firstTime = false;

const useAllTiers = () => {
  const [tiers, setTiers] = useRecoilState(allTierAtom);

  const fetchAllTiers = async () => {
    loading = true;
    try {
      const res = await request.get("/inventory/getAllTiers");
      if (res.status != 200) return;
      setTiers(res.data.data);
    } catch (error) {
      console.error("Error fetching tiers:", error);
    } finally {
      loading = false;
    }
  };
  
  if (!firstTime) {
    fetchAllTiers();
    firstTime = true;
  }
  
  const refetchTiers = () => {
    if(loading) return;
    setTiers([]);
    fetchAllTiers();
  }

  return { tiers, loading, refetchTiers };
};

export { useAllTiers };