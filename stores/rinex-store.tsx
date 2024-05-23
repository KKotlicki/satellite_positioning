import type { AstronomyFile, RinexMeteo, RinexNavigation, RinexObservation } from "@/global/types";
import type { DateRange } from "@mui/x-date-pickers-pro";
import dayjs, { type Dayjs } from "dayjs";
import { useZustand } from "use-zustand";
import { createStore } from 'zustand/vanilla';


type RinexStore = {
  rinexNavigationFile: AstronomyFile<RinexNavigation>
  rinexObservationFile: AstronomyFile<RinexObservation>
  rinexMeteoFile: AstronomyFile<RinexMeteo>

  observationPeriod: DateRange<Dayjs>

  actions: {
    changeRinexNavigationFile: (newRinexNavigationFile: AstronomyFile<RinexNavigation>) => void
    changeRinexObservationFile: (newrinexObservationFile: AstronomyFile<RinexObservation>) => void
    changeRinexMeteoFile: (newrinexMeteoFile: AstronomyFile<RinexMeteo>) => void
    changeRinexObservationPeriod: (newObservationStartDate: DateRange<Dayjs>) => void
  }
}

const useRinexStore = createStore<RinexStore>((set) => ({
  rinexNavigationFile: {
    name: "RINEX Navigation",
    extensions: ["rnx"],
  },
  rinexObservationFile: {
    name: "RINEX Observation",
    extensions: ["rnx"],
  },
  rinexMeteoFile: {
    name: "RINEX Meteo",
    extensions: ["rnx"],
  },
  observationPeriod: [
    dayjs().startOf("day"),
    dayjs().startOf("day")
  ],
  actions: {
    changeRinexNavigationFile: (newRinexNavigationFile) => set(() => ({ rinexNavigationFile: newRinexNavigationFile })),
    changeRinexObservationFile: (newRinexObservationFile) => set(() => ({ rinexObservationFile: newRinexObservationFile })),
    changeRinexMeteoFile: (newRinexMeteoFile) => set(() => ({ rinexMeteoFile: newRinexMeteoFile })),
    changeRinexObservationPeriod: (newObservationPeriod) => set(() => ({ observationPeriod: newObservationPeriod })),
  }
}))

export const useRinexObservationPeriod = () => useZustand(useRinexStore, (state) => state.observationPeriod);
export const useRinexNavigationFile = () => useZustand(useRinexStore, (state) => state.rinexNavigationFile);
export const useRinexObservationFile = () => useZustand(useRinexStore, (state) => state.rinexObservationFile);
export const useRinexMeteoFile = () => useZustand(useRinexStore, (state) => state.rinexMeteoFile);
export const useRinexActions = () => useZustand(useRinexStore, (state) => state.actions);
