import { useRecoilState } from "recoil";
import allItemsAtom, { itemType } from "@/store/inventory/Items";
import request from "./request";

let loading = false;

const useFetchAllItems = () => {
  const [items, setItems] = useRecoilState(allItemsAtom);

  const fetchAllItems = async () => {
    loading = true;
    try {
      const res = await request("/inventory/getAllItems");
      setItems(res.data.data as itemType[]);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      loading = false;
    }
  };
  
  if (items.length === 0 && !loading) {
    fetchAllItems();
  }
  
  const refetchItems = () => {
    setItems([]);
    fetchAllItems();
  }

  return { items, loading, refetchItems };
};

export { useFetchAllItems };
