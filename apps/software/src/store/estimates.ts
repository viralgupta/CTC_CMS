import { atom } from "recoil";

export interface EstimateType {
  id: string;
  updated_at: Date;
  total_estimate_amount: string;
  customer: {
    name: string;
    id: string;
  };
}
[];

export const allEstimateAtom = atom<EstimateType[]>({
  key: "allEstimateAtom",
  default: [],
});

export interface ViewEstimateType {
  customer_id: string;
  id: string;
  created_at: Date;
  updated_at: Date;
  total_estimate_amount: string;
  estimate_items: {
    item_id: string;
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
    id: string;
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

export const viewEstimateIdAtom = atom<string | null>({
  key: "viewEstimateIdAtom",
  default: null,
});
