import { atom } from "recoil";

export interface EstimateType {
  id: number;
  updated_at: Date;
  total_estimate_amount: string;
  customer: {
    name: string;
    id: number;
  };
}
[];

export const allEstimateAtom = atom<EstimateType[]>({
  key: "allEstimateAtom",
  default: [],
});

export interface ViewEstimateType {
  id: number;
  customer_id: number;
  created_at: Date;
  updated_at: Date;
  total_estimate_amount: string;
  estimate_items: {
    item_id: number;
    quantity: number;
    rate: number;
    total_value: string;
    item: {
      name: string;
      rate_dimension: "Rft" | "sq/ft" | "piece";
    };
  }[];
  customer: {
    name: string;
    id: number;
    profileUrl: string | null;
    balance: string | null;
    phone_numbers: {
      phone_number: string;
      country_code: string | null;
    }[];
  };
}

export const viewEstimateAtom = atom<ViewEstimateType | null>({
  key: "viewEstimateAtom",
  default: null,
});

export const viewEstimateIdAtom = atom<number | null>({
  key: "viewEstimateIdAtom",
  default: null,
});
