import { atom } from "recoil";

export interface CustomerType {
  id: string;
  name: string;
  balance: string | null;
  addresses: {
    house_number: string;
    address_area: {
      area: string;
    }; // only one in array or null;
  }[];
  phone_numbers: {
    phone_number: string;
  }[]; // only one in array or null;
}[];

export interface viewCustomerType extends CustomerType {
  profileUrl: string | null;
  priority: "Low" | "Mid" | "High" | null;
  addresses: {
    id: string;
    customer_id: string;
    isPrimary: boolean | undefined;
    address: string;
    house_number: string;
    address_area_id: string;
    city: string;
    state: string;
    latitude: number | undefined;
    longitude: number | undefined;
    address_area: {
      id: string;
      area: string;
    };
  }[];
  phone_numbers: {
    id: string;
    phone_number: string;
    country_code?: string | undefined;
    whatsappChatId?: string | undefined;
    isPrimary?: boolean | undefined;
  }[];
  orders: {
    id: number;
    priority: "Low" | "High" | "Medium";
    status: "Pending" | "Delivered";
    payment_status: "UnPaid" | "Partial" | "Paid";
    total_order_amount: string;
    amount_paid: string | null;
    created_at: Date;
  }[];
  estimates: {
    id: string;
    created_at: Date;
    updated_at: Date;
    total_estimate_amount: string;
  }[];
}

export const allCustomerAtom = atom<CustomerType[]>({
  key: "allCustomerAtom",
  default: [],
});

export const viewCustomerAtom = atom<viewCustomerType | null>({
  key: "viewCustomerAtom",
  default: null,
});

export const viewCustomerIDAtom = atom<string | null>({
  key: "viewCustomerIDAtom",
  default: null,
});
