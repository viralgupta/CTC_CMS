import { atom } from "recoil";

export enum CommissionType {
  Percentage = "percentage",
  PerPiece = "perPiece",
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;

  quantity: number;
  rate: number;
  total_value: number;

  carpanter_commision?: number | null;
  carpanter_commision_type?: CommissionType | null;

  architect_commision?: number | null;
  architect_commision_type?: CommissionType | null;

  created_at: Date;
  updated_at: Date;
}

export const viewOrderIdAtom = atom<string | null>({
  key: "viewOrderIdAtom",
  default: null,
});