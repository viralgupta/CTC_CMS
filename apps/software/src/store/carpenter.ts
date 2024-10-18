import { atom } from "recoil";

export const viewCarpenterIdAtom = atom<string | null>({
  key: "viewCarpenterIdAtom",
  default: null,
})