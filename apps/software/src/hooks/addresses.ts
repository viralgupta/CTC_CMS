import { useRecoilState } from "recoil";
import request from "@/lib/request";
import { AddressType, allAddressAtom } from "@/store/address";

let loading = false;

const useAllAddresses = () => {
  const [addresses, setAddresses] = useRecoilState(allAddressAtom);

  const fetchAllAddresses = async () => {
    loading = true;
    try {
      const res = await request("/customer/getAllAddresses");
      if (res.status != 200) return;
      setAddresses(res.data.data as AddressType[]);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      loading = false;
    }
  };
  
  if (addresses.length === 0 && !loading) {
    fetchAllAddresses();
  }
  
  const refetchAddresses = () => {
    setAddresses([]);
    fetchAllAddresses();
  }

  return { addresses, loading, refetchAddresses };
};

export { useAllAddresses };
