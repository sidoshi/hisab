import { atom } from "jotai";

export const colorModeAtom = atom<"light" | "dark">("dark");
export const toggleColorModeAtom = atom(null, (get, set) => {
  set(colorModeAtom, get(colorModeAtom) === "light" ? "dark" : "light");
});
