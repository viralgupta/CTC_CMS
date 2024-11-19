import { useRecoilState } from "recoil";
import request from "@/lib/request";
import { allWarehouseAtom } from "@/store/warehouse";

let loading = false;
let firstTime = false;

const useAllWarehouse = () => {
  const [warehouse, setWarehouses] = useRecoilState(allWarehouseAtom);

  const fetchAllWarehouses = async () => {
    loading = true;
    try {
      const res = await request.get("/inventory/getAllWarehouse");
      if (res.status != 200) return;
      setWarehouses(res.data.data);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    } finally {
      loading = false;
    }
  };
  
  if (!firstTime) {
    fetchAllWarehouses();
    firstTime = true;
  }
  
  const refetchWarehouses = () => {
    if(loading) return;
    setWarehouses([]);
    fetchAllWarehouses();
  }

  return { warehouse, loading, refetchWarehouses };
};

export { useAllWarehouse };