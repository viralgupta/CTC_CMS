import { useRecoilState } from "recoil";
import request from "@/lib/request";
import { allArchitectAtom, ArchitectType } from "@/store/architect";

let loading = false;

const useAllArchitect = () => {
  const [architects, setArchitects] = useRecoilState(allArchitectAtom);

  const fetchAllArchitects = async () => {
    loading = true;
    try {
      const res = await request("/architect/getAllArchitects");
      if (res.status != 200) return;
      setArchitects(res.data.data as ArchitectType[]);
    } catch (error) {
      console.error("Error fetching architect:", error);
    } finally {
      loading = false;
    }
  };
  
  if (architects.length === 0 && !loading) {
    fetchAllArchitects();
  }
  
  const refetchArchitects = () => {
    setArchitects([]);
    fetchAllArchitects();
  }

  return { architects, loading, refetchArchitects };
};

export { useAllArchitect };
