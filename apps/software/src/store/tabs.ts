import { atom } from "recoil";

const tabAtom = atom<"home" | "order" | "customer" | "address" | "inventory" | "estimate" | "carpanter" | "architect" | "driver" | "resources">({
  key: "tabAtom",
  default: "home"
})

export default tabAtom;