import { atom } from "recoil";

export interface CarpenterType {
  name: string;
  id: string;
  balance: string | null;
  area: string;
  phone_numbers: {
    phone_number: string;
  }[];
}

export interface ViewCarpenterType extends CarpenterType {
  profileUrl: string | null;
  phone_numbers: {
    id: string;
    phone_number: string;
    country_code: string | null;
    whatsappChatId: string | null;
    isPrimary: boolean | null;
  }[];
  orders: {
    id: number;
    status: "Pending" | "Delivered";
    carpanter_commision: string | null;
    created_at: Date;
    customer: {
      name: string;
    } | null;
    delivery_address: {
      house_number: string;
      address: string;
    } | null;
  }[];
}

export const allCarpenterAtom = atom<CarpenterType[]>({
  key: "allCarpenterAtom",
  default: [],
});

export const viewCarpenterIdAtom = atom<string | null>({
  key: "viewCarpenterIdAtom",
  default: null,
});

export const viewCarpenterAtom = atom<ViewCarpenterType | null>({
  key: "viewCarpenterAtom",
  default: null,
});
