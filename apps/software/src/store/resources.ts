import { atom } from "recoil";

export interface ResourceType {
  id: number;
  name: string;
  previewUrl?: string;
  extension: string | null;
}

export const allResourcesAtom = atom<ResourceType[]>({
  key: "allResourcesAtom",
  default: []
});

export interface ViewResourceType extends Omit<ResourceType, "previewUrl"> {
  description: string | null;
  key: string;
  url: string;
}

export const viewResourceAtom = atom<ViewResourceType | null>({
  key: "viewResourceAtom",
  default: null
});

export const viewResourceIdAtom = atom<number | null>({
  key: "viewResourceIdAtom",
  default: null
});