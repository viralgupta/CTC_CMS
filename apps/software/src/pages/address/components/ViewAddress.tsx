import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRecoilState } from "recoil";
import request from "@/lib/request";
import { viewAddressAtom, viewAddressIdAtom, ViewAddressType } from "@/store/address";
import AddressCard from "./AddressCard/AddressCard";
import AddressOrders from "./AddressOrders";

const ViewAddress = () => {
  let [viewAddressId, setViewAddressId] = useRecoilState(viewAddressIdAtom);
  const [viewAddress, setViewAddress] = useRecoilState(viewAddressAtom);

  React.useEffect(() => {
    if (viewAddressId) {
      request(`/customer/getAddress?address_id=${viewAddressId}`).then((res) => {
        if(res.status != 200) return;
        setViewAddress(res.data.data as ViewAddressType);
      })
    }
  }, [viewAddressId]);

  return (
    <Dialog
      key={viewAddressId}
      open={viewAddressId ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setViewAddress(null);
          setViewAddressId(null);
          return;
        }
      }}
    >
      <DialogContent size="5xl">
        <DialogHeader className="hidden">
          <DialogDescription></DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <AddressCard address={viewAddress}/>
        <AddressOrders address={viewAddress}/>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAddress;
