import { atom } from "recoil";

export interface AllTierType {
  id: number;
  name: string;
}

export const allTierAtom = atom<AllTierType[]>({
  key: "allTierAtom",
  default: [],
});