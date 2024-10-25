import { atom } from "recoil";

export interface DriverType {
  name: string;
  id: string;
  size_of_vehicle: "rickshaw" | "tempo" | "chota-hathi" | "tata" | "truck";
  activeOrders: number | null;
  phone_numbers: {
    phone_number: string;
  }[];
}

export interface ViewDriverType extends DriverType {
  profileUrl: string | null;
  vehicle_number: string | null;
  phone_numbers: {
    id: string;
    phone_number: string;
    country_code: string | null;
    whatsappChatId: string | null;
    isPrimary: boolean | null;
  }[];
  orders: {
    id: string;
    status: "Pending" | "Delivered";
    created_at: Date;
    customer: {
      name: string;
    } | null;
    delivery_address: {
      address: string;
      house_number: string;
    } | null;
  }[];
}

export const allDriverAtom = atom<DriverType[]>({
  key: "allDriverAtom",
  default: [],
});

export const viewDriverIdAtom = atom<string | null>({
  key: "viewDriverIdAtom",
  default: null,
});

export const viewDriverAtom = atom<ViewDriverType | null>({
  key: "viewDriverAtom",
  default: null,
});