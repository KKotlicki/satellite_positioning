import type { RINEX, AstronomyFile } from "@/global/types";
import { useZustand } from "use-zustand";
import { createStore } from 'zustand/vanilla';

type RinexStore = {
	rinexFile: AstronomyFile<RINEX>
  actions: {
    changeRinexFile: (newRinexFile: AstronomyFile<RINEX>) => void  
  }
}

const useRinexStore = createStore<RinexStore>((set) => ({
	rinexFile: {
    name: "RINEX",
    extensions: ["rnx"],
    fileName: null,
    content: null
  },
  actions: {
    changeRinexFile: (newRinexFile) => set(() => ({ rinexFile: newRinexFile }))
  }
}))

export const useRinexFile = () => useZustand(useRinexStore, (state) => state.rinexFile);
export const useRinexActions = () => useZustand(useRinexStore, (state) => state.actions);