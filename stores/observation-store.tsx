import type { AstronomyFile, RinexObservation } from "@/global/types";
import { useZustand } from "use-zustand";
import { createStore } from 'zustand/vanilla';


type ObservationStore = {
  observationFile: AstronomyFile<RinexObservation> | null,

  actions: {
    changeObservationFile: (newObservationFile: AstronomyFile<RinexObservation>) => void
  }
}

const useObservationStore = createStore<ObservationStore>((set) => ({
  observationFile: null,

  actions: {
    changeObservationFile: (newObservationFile) => set(() => ({ observationFile: newObservationFile })),
  }
}))

export const useObservationFile = () => useZustand(useObservationStore, (state) => state.observationFile);
export const useObservationActions = () => useZustand(useObservationStore, (state) => state.actions);
