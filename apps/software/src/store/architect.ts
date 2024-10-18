import { atom } from "recoil";

export const viewArchitectIdAtom = atom<string | null>({
  key: "viewArchitectIdAtom",
  default: null,
})