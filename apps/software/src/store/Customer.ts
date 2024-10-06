import { atom } from "recoil";

export interface CustomerType {
  id: string;
  name: string;
  balance: string | null;
  addresses: {
      house_number: string;
      address_area: {
          area: string;
      } // only one in array or null;
  }[];
}[]

export interface viewCustomerType extends CustomerType {
  profileUrl: string | null;
  priority: "Low" | "Mid" | "High" | null;
  
}

const allCustomerAtom = atom<CustomerType[]>({
  key: "allCustomerAtom",
  default: []
});

export const viewCustomerAtom = atom<viewCustomerType | null>({
  key: "viewCustomerAtom",
  default: null
});

export const viewCustomerIDAtom = atom<string | null>({
  key: "viewCustomerIDAtom",
  default: null
});


export default allCustomerAtom;