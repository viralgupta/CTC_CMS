import { useRecoilState } from "recoil";
import request from "@/lib/request";
import { allResourcesAtom, ResourceType } from "@/store/resources";

let loading = false;
let firstTime = false;

const useAllResources = () => {
  const [resources, setResources] = useRecoilState(allResourcesAtom);

  const fetchAllResources = async () => {
    loading = true;
    try {
      const res = await request("/miscellaneous/getAllResources");
      if (res.status != 200) return;
      setResources(res.data.data as ResourceType[]);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      loading = false;
    }
  };
  
  if (!firstTime) {
    fetchAllResources();
    firstTime = true;
  }
  
  const refetchResources = () => {
    if(loading) return;
    setResources([]);
    fetchAllResources();
  }

  return { resources, loading, refetchResources };
};

export { useAllResources };
