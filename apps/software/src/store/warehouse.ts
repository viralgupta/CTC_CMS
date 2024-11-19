import { atom } from "recoil";

export interface WarehouseType {
  id: string;
  name: string;
}


export const allWarehouseAtom = atom<WarehouseType[]>({
  key: "allWarehouseAtom",
  default: [],
});