import { atom } from "recoil";

export interface WarehouseType {
  id: number;
  name: string;
}

export const allWarehouseAtom = atom<WarehouseType[]>({
  key: "allWarehouseAtom",
  default: [],
});