import { atom } from "recoil";

export interface CarpenterType {
  name: string;
  id: number;
  balance: string | null;
  area: string;
  phone_numbers: {
    phone_number: string;
  }[];
}

export interface ViewCarpenterType extends CarpenterType {
  profileUrl: string | null;
  tier_id: number;
  phone_numbers: {
    id: number;
    phone_number: string;
    country_code: string | null;
    whatsappChatId: string | null;
    isPrimary: boolean | null;
  }[];
  orders: {
    id: number;
    status: "Pending" | "Delivered";
    carpenter_commision: string | null;
    created_at: Date;
    customer: {
      name: string;
    } | null;
    delivery_address: {
      house_number: string;
      address: string;
    } | null;
  }[];
  tier: {
    name: string;
  };
}

export const allCarpenterAtom = atom<CarpenterType[]>({
  key: "allCarpenterAtom",
  default: [],
});

export const viewCarpenterIdAtom = atom<number | null>({
  key: "viewCarpenterIdAtom",
  default: null,
});

export const viewCarpenterAtom = atom<ViewCarpenterType | null>({
  key: "viewCarpenterAtom",
  default: null,
});
