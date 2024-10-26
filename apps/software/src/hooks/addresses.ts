import { useRecoilState } from "recoil";
import request from "@/lib/request";
import { AddressType, allAddressAtom } from "@/store/address";

let loading = false;
let firstTime = false;

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
  
  if (!firstTime) {
    fetchAllAddresses();
    firstTime = true;
  }
  
  const refetchAddresses = () => {
    if(loading) return;
    setAddresses([]);
    fetchAllAddresses();
  }

  return { addresses, loading, refetchAddresses };
};

export { useAllAddresses };
