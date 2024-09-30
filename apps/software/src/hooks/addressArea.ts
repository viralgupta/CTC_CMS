import { useRecoilState } from "recoil";
import addressAreaAtom, { AddressArea } from "@/store/addressArea";
import request from "../lib/request";

let loading = false;

const useAddressAreas = () => {
  const [addressAreas, setAddressAreas] = useRecoilState(addressAreaAtom);

  const fetchAllItems = async () => {
    loading = true;
    try {
      const res = await request("/customer/getAllAddressAreas");
      setAddressAreas(res.data.data as AddressArea);
    } catch (error) {
      console.error("Error fetching address areas:", error);
    } finally {
      loading = false;
    }
  };
  
  if (addressAreas.length === 0 && !loading) {
    fetchAllItems();
  }
  
  const refetchAddressAreas = () => {
    setAddressAreas([]);
    fetchAllItems();
  }

  return { addressAreas, loading, refetchAddressAreas };
};

export { useAddressAreas };
