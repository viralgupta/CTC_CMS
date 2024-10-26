import { useRecoilState } from "recoil";
import addressAreaAtom, { AddressArea } from "@/store/addressArea";
import request from "../lib/request";

let loading = false;
let firstTime = false;

const useAddressAreas = () => {
  const [addressAreas, setAddressAreas] = useRecoilState(addressAreaAtom);

  const fetchAllItems = async () => {
    loading = true;
    try {
      const res = await request("/customer/getAllAddressAreas");
      if (res.status != 200) return;
      setAddressAreas(res.data.data as AddressArea);
    } catch (error) {
      console.error("Error fetching address areas:", error);
    } finally {
      loading = false;
    }
  };
  
  if (!firstTime) {
    fetchAllItems();
    firstTime = true;
  }
  
  const refetchAddressAreas = () => {
    if(loading) return;
    setAddressAreas([]);
    fetchAllItems();
  }

  return { addressAreas, loading, refetchAddressAreas };
};

export { useAddressAreas };
