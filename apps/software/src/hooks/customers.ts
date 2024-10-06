import { useRecoilState } from "recoil";
import allCustomerAtom, { CustomerType } from "@/store/Customer";
import request from "@/lib/request";

let loading = false;

const useAllCustomer = () => {
  const [customers, setCustomer] = useRecoilState(allCustomerAtom);

  const fetchAllCustomer = async () => {
    loading = true;
    try {
      const res = await request("/customer/getAllCustomers");
      setCustomer(res.data.data as CustomerType[]);
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      loading = false;
    }
  };
  
  if (customers.length === 0 && !loading) {
    fetchAllCustomer();
  }
  
  const refetchCustomers = () => {
    setCustomer([]);
    fetchAllCustomer();
  }

  return { customers, loading, refetchCustomers };
};

export { useAllCustomer };
