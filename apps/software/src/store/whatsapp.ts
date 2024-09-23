import { atom } from "recoil";
import { toast } from "sonner";

export const WhatsappQrAtom = atom<string | null>({
  key: "WhatsappQrAtom",
  default: null,
  effects: [({setSelf}) => {
    window.ipcRenderer.on("qr-created", (_ev, qr) => {
      setSelf(qr);
    })
    window.ipcRenderer.on("whatsapp-connected", () => {
      setSelf(null);
    })
  }]
})

export const WhatsappConnectedAtom = atom<boolean>({
  key: "WhatsappConnectedAtom",
  default: false,
  effects: [({setSelf}) => {
    window.ipcRenderer.on("whatsapp-connected", () => {
      setSelf(true);
      toast.success("Whatsapp Connected!!!")
    })
    window.ipcRenderer.on("whatsapp-disconnected", () => {
      setSelf(false);
    })
  }]
})