import { atom } from "recoil";

// const tabAtom = atom<"home" | "order" | "customer" | "address" | "inventory" | "estimate" | "carpenter" | "architect" | "driver" | "resources">({
const tabAtom = atom<"order" | "customer" | "address" | "inventory" | "estimate" | "carpenter" | "architect" | "driver" | "resources">({
  key: "tabAtom",
  default: "order"
})

export default tabAtom;