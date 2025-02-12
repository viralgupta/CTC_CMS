import { atom } from "recoil";

export interface DriverType {
  name: string;
  id: number;
  size_of_vehicle: "rickshaw" | "tempo" | "chota-hathi" | "tata" | "truck";
  activeDeliveries: number | null;
  phone_numbers: {
    phone_number: string;
  }[];
}

export interface ViewDriverType extends DriverType {
  profileUrl: string | null;
  vehicle_number: string | null;
  phone_numbers: {
    id: number;
    phone_number: string;
    country_code: string | null;
    whatsappChatId: string | null;
    isPrimary: boolean | null;
  }[];
  order_movements: {
    type: "DELIVERY" | "RETURN";
    status: "Pending" | "Completed";
    id: number;
    order_id: number;
    created_at: Date;
    labour_frate_cost: number;
    order: {
        id: number;
        customer: {
            name: string;
        } | null;
        delivery_address: {
            address: string;
            house_number: string;
        } | null;
    };
  }[]
}

export const allDriverAtom = atom<DriverType[]>({
  key: "allDriverAtom",
  default: [],
});

export const viewDriverIdAtom = atom<number | null>({
  key: "viewDriverIdAtom",
  default: null,
});

export const viewDriverAtom = atom<ViewDriverType | null>({
  key: "viewDriverAtom",
  default: null,
});
