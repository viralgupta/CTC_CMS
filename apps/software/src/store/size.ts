import { atom, selector } from "recoil";

const windowHeightOffset = isNaN(Number(import.meta.env.VITE_WINDOW_HEIGHT_OFFSET)) ? 150 : Number(import.meta.env.VITE_WINDOW_HEIGHT_OFFSET);

export const WindowHeightAtom = atom<number>({
  key: "WindowHeightAtom",
  default: selector<number>({
    key: "WindowHeightSelector",
    get: async () => {
      const height = await window.ipcRenderer.invoke("window-height");
      return height - windowHeightOffset;
    }
  }),
  effects: [({setSelf}) => {
    window.ipcRenderer.on("resize-body", (_e, height) => {
      setSelf(height - windowHeightOffset);
    });
  }]
})