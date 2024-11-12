import { useRecoilState } from "recoil";
import { allItemsAtom, itemType } from "@/store/Items";
import request from "@/lib/request";

let loading = false;
let firstTime = false;

const useAllItems = () => {
  const [items, setItems] = useRecoilState(allItemsAtom);

  const fetchAllItems = async () => {
    loading = true;
    try {
      const res = await request("/inventory/getAllItems");
      if (res.status != 200) return;
      setItems(res.data.data as itemType[]);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      loading = false;
    }
  };
  
  if (!firstTime) {
    fetchAllItems();
    firstTime = true;
  }
  
  const refetchItems = () => {
    if(loading) return;
    setItems([]);
    fetchAllItems();
  }

  return { items, loading, refetchItems };
};

export { useAllItems };
