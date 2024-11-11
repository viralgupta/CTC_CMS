import request from "@/lib/request";
import { useSetRecoilState } from "recoil";
import {
  viewCustomerAtom,
  viewCustomerIDAtom,
  viewCustomerType,
} from "@/store/customer";
import React from "react";
import AddressInput from "@/components/Inputs/AddressInput/AddressInput";
import { addressType } from "@type/api/miscellaneous";
import { z } from "zod";
import { allAddressAtom, viewAddressIdAtom } from "@/store/address";

const ViewAllAddresses = ({
  children,
  values,
  customer_id
}: {
  children: React.ReactNode;
  values: viewCustomerType["addresses"];
  customer_id: string,
}) => {
  const setViewCustomerId = useSetRecoilState(viewCustomerIDAtom);
  const setViewCustomer = useSetRecoilState(viewCustomerAtom);
  const setViewAddressId = useSetRecoilState(viewAddressIdAtom);
  const setAllAddresses = useSetRecoilState(allAddressAtom);

  const AddAddress = (
    data: z.infer<typeof addressType>
  ) => {
    request.post("/customer/addAddress", {
      ...data,
      customer_id: customer_id
    }).then(res => {
      if (res.status == 200) {
        setViewCustomer(null);
        setViewCustomerId(null);
        setAllAddresses([]);
      }
    })
  };

  return (
    <AddressInput
      viewAddress={setViewAddressId}
      AddAddress={AddAddress}
      values={values.map((address) => {
        return {
          house_number: address.house_number,
          address_area_id: address.address_area.id,
          address_area: address.address_area.area,
          address: address.address,
          city: address.city,
          state: address.state,
          cordinates: {
            latitude: address.latitude,
            longitude: address.latitude,
          },
          isPrimary: address.isPrimary,
          id: address.id,
        };
      })}
      children={children}
    />
  );
};

export default ViewAllAddresses;