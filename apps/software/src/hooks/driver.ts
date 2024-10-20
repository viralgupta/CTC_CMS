import { useRecoilState } from "recoil";
import request from "@/lib/request";
import { allDriverAtom, DriverType } from "@/store/driver";

let loading = false;
let firstTime = false;

const useAllDrivers = () => {
  const [drivers, setDrivers] = useRecoilState(allDriverAtom);

  const fetchAllDrivers = async () => {
    loading = true;
    try {
      const res = await request("/driver/getAllDrivers");
      if (res.status != 200) return;
      setDrivers(res.data.data as DriverType[]);
    } catch (error) {
      console.error("Error fetching driver:", error);
    } finally {
      loading = false;
    }
  };
  
  if (!firstTime) {
    fetchAllDrivers();
    firstTime = true;
  }
  
  const refetchDrivers = () => {
    setDrivers([]);
    fetchAllDrivers();
  }

  return { drivers, loading, refetchDrivers };
};

export { useAllDrivers };