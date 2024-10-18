import { useRecoilState } from "recoil";
import request from "@/lib/request";
import { allCarpenterAtom, CarpenterType } from "@/store/carpenter";

let loading = false;

const useAllCarpenter = () => {
  const [carpenters, setCarpenters] = useRecoilState(allCarpenterAtom);

  const fetchAllCarpenters = async () => {
    loading = true;
    try {
      const res = await request("/carpenter/getAllCarpanters");
      if (res.status != 200) return;
      setCarpenters(res.data.data as CarpenterType[]);
    } catch (error) {
      console.error("Error fetching carpenter:", error);
    } finally {
      loading = false;
    }
  };
  
  if (carpenters.length === 0 && !loading) {
    fetchAllCarpenters();
  }
  
  const refetchCarpenters = () => {
    setCarpenters([]);
    fetchAllCarpenters();
  }

  return { carpenters, loading, refetchCarpenters };
};

export { useAllCarpenter };
