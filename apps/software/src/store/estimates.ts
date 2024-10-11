import { atom } from "recoil";

export const viewEstimateIdAtom = atom<string | null>({
  key: "viewEstimateIdAtom",
  default: null,
});