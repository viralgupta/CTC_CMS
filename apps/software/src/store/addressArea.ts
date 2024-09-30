import { atom } from "recoil";

export type AddressArea = {
  id: string;
  area: string;
}[];

const addressAreaAtom = atom<AddressArea>({
  key: "addressAreaAtom",
  default: []
});

export default addressAreaAtom;