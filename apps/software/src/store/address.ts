import { atom } from "recoil";

export interface AddressType {
  id: number;
  isPrimary: boolean | null;
  address: string;
  house_number: string;
  city: string;
  customer: {
      name: string;
      id: number;
  };
  address_area: {
      id: number;
      area: string;
  };
};

export interface ViewAddressType {
  id: number;
  isPrimary: boolean | null;
  address: string;
  house_number: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  customer: {
    id: number;
    name: string;
  };
  address_area: {
    id: number;
    area: string;
  };
  orders: {
    id: number;
    status: "Pending" | "Delivered";
    payment_status: "UnPaid" | "Partial" | "Paid";
    delivery_date: Date | null;
    total_order_amount: string;
    created_at: Date;
  }[]
}

export const allAddressAtom = atom<AddressType[]>({
  key: "allAddressAtom",
  default: [],
});

export const viewAddressIdAtom = atom<number | null>({
  key: "viewAddressIdAtom",
  default: null,
})

export const viewAddressAtom = atom<ViewAddressType | null>({
  key: "viewAddressAtom",
  default: null
})