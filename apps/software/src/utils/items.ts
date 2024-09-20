import * as React from 'react';
import { useRecoilState } from "recoil";
import itemAtom, { itemType } from "@/store/inventory/Items";
import request from "./request";

let loading = false;

const useFetchAllItems = () => {
  const [items, setItems] = useRecoilState(itemAtom);

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

  React.useEffect(() => {
    if (items.length === 0 && !loading) {
      fetchAllItems();
    }
  }, [items, loading]);

  const refetchItems = () => {
    setItems([]);
    fetchAllItems();
  }

  return { items, loading, refetchItems };
};

export { useFetchAllItems };
