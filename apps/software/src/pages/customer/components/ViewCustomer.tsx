import { viewCustomerAtom, viewCustomerIDAtom, viewCustomerType } from "@/store/Customer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRecoilState } from "recoil";
import request from "@/lib/request";
import CustomerCard from "./CustomerCard/CustomerCard";
import React from "react";

const ViewCustomer = () => {
  const [viewCustomerId, setViewCustomerID] = useRecoilState(viewCustomerIDAtom);
  const [viewCustomer, setViewCustomer] = useRecoilState(viewCustomerAtom);

  React.useEffect(() => {
    if (viewCustomerId) {
      request(`/customer/getCustomer?customer_id=${viewCustomerId}`).then((res) => {
        if(res.status != 200) return;
        setViewCustomer(res.data.data as viewCustomerType);
      })
    }
  }, [viewCustomerId]);

  return (
    <Dialog
      open={viewCustomerId ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setViewCustomer(null);
          setViewCustomerID(null);
          return;
        }
      }}
    >
      <DialogContent size="5xl">
        <DialogHeader className="hidden">
          <DialogDescription></DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
          <CustomerCard customer={viewCustomer}/>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCustomer;