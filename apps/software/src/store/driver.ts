import { atom } from "recoil";

export const viewDriverIdAtom = atom<string | null>({
  key: "viewDriverIdAtom",
  default: null,
})