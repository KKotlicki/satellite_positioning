import type { AstronomyFile, RinexMeteo } from "@/global/types";
import { useZustand } from "use-zustand";
import { createStore } from 'zustand/vanilla';


type MeteoStore = {
  meteoFile: AstronomyFile<RinexMeteo> | null,

  actions: {
    changeMeteoFile: (newMeteoFile: AstronomyFile<RinexMeteo>) => void
  }
}

const useMeteoStore = createStore<MeteoStore>((set) => ({
  meteoFile: null,

  actions: {
    changeMeteoFile: (newMeteoFile) => set(() => ({ meteoFile: newMeteoFile })),
  }
}))

export const useMeteoFile = () => useZustand(useMeteoStore, (state) => state.meteoFile);
export const useMeteoActions = () => useZustand(useMeteoStore, (state) => state.actions);
