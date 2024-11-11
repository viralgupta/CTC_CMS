import { useRecoilState } from "recoil";
import allCustomerAtom, { CustomerType } from "@/store/customer";
import request from "@/lib/request";

let loading = false;
let firstTime = false;

const useAllCustomer = () => {
  const [customers, setCustomer] = useRecoilState(allCustomerAtom);

  const fetchAllCustomer = async () => {
    loading = true;
    try {
      const res = await request("/customer/getAllCustomers");
      if (res.status != 200) return;
      setCustomer(res.data.data as CustomerType[]);
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      loading = false;
    }
  };
  
  if (!firstTime) {
    fetchAllCustomer();
    firstTime = true;
  }
  
  const refetchCustomers = () => {
    if(loading) return;
    setCustomer([]);
    fetchAllCustomer();
  }

  return { customers, loading, refetchCustomers };
};

export { useAllCustomer };
