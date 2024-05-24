import { satelliteProviders } from "@/global/constants";
import type { Almanac, AstronomyFile, DOPList, RinexNavigation, SatellitePath, SatellitePathGeocentric, SelectedSatellites, SkyPath } from "@/global/types";
import {
  calculateDOP,
  calculateSatellitePositions,
  calculateSatellitePositionsGeocentric,
  calculateSkyPositions
} from "@/services/astronomy";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useZustand } from "use-zustand";
import { createStore } from 'zustand/vanilla';


dayjs.extend(utc);

const generateInitialSelectedTocs = () => {
  const start = dayjs.utc().startOf('day').unix() - 315964800;
  const end = dayjs.utc().startOf('day').add(1, 'day').unix() - 315964800;
  const interval = (end - start) / 144;
  const tocs = Array.from({ length: 145 }, (_, i) => Math.round(start + i * interval));

  return tocs;
};

function orderNewSelectedSatellites(newSelectedSatellites: SelectedSatellites): SelectedSatellites {
  const providerOrder = satelliteProviders.map(provider => provider.prefix);

  const sortedProviders = Object.keys(newSelectedSatellites).sort((a, b) => {
    const indexA = providerOrder.indexOf(a);
    const indexB = providerOrder.indexOf(b);
    return indexA - indexB;
  });

  const sortedNewSelectedSatellites: SelectedSatellites = {};
  for (const provider of sortedProviders) {
    const prnsObjects = newSelectedSatellites[provider];
    if (prnsObjects === undefined) continue;
    const prns = Object.keys(prnsObjects).sort((a, b) => {
      const idA = Number.parseInt(a.slice(1));
      const idB = Number.parseInt(b.slice(1));
      return idA - idB;
    });

    sortedNewSelectedSatellites[provider] = {};
    for (const prn of prns) {
      const prnObject = prnsObjects[prn];
      if (prnObject === undefined) continue;
      sortedNewSelectedSatellites[provider][prn] = prnObject;
    }
  }

  return sortedNewSelectedSatellites;
}

type NavigationStore = {
  latitude: number;
  longitude: number;
  height: number;
  elevationCutoff: number;
  selectedTocs: number[];
  time: number;
  navigationFile: AstronomyFile<Almanac | RinexNavigation> | null;
  selectedSatellites: SelectedSatellites;
  GNSS: SatellitePath;
  GNSSGeocentric: SatellitePathGeocentric;
  sky: SkyPath;
  DOP: DOPList;
  actions: {
    changeLatitude: (newLatitude: number) => void;
    changeLongitude: (newLongitude: number) => void;
    changeHeight: (newHeight: number) => void;
    changeElevationCutoff: (newElevationCutoff: number) => void;
    changeSelectedTocs: (newSelectedTocs: number[]) => void;
    changeTime: (newTime: number) => void;
    changeNavigationFile: (newNavigationFile: AstronomyFile<Almanac | RinexNavigation>) => void;
    changeSelectedSatellites: (newSelectedSatellites: SelectedSatellites) => void;
  };
};

const useNavigationStore = createStore<NavigationStore>((set) => ({
  selectedTocs: generateInitialSelectedTocs(),
  navigationFile: null,
  GNSS: {},
  GNSSGeocentric: {},
  latitude: 0,
  longitude: 0,
  height: 480,
  elevationCutoff: 7,
  selectedSatellites: {},
  sky: {},
  DOP: {},
  time: 72,

  actions: {
    changeNavigationFile: (newNavigationFile) =>
      set(({ selectedTocs, latitude, longitude, height, elevationCutoff, selectedSatellites }) => {
        const content = newNavigationFile.content;
        if (content === undefined) return { navigationFile: null };
        const GNSS = calculateSatellitePositions(content, selectedTocs);
        const GNSSGeocentric = calculateSatellitePositionsGeocentric(GNSS);
        const sky = calculateSkyPositions(GNSS, latitude, longitude, height);
        const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, elevationCutoff, selectedSatellites);
        return {
          navigationFile: newNavigationFile,
          GNSS,
          GNSSGeocentric,
          sky,
          DOP
        };
      }),

    changeTime: (newTime) => set(() => ({ time: newTime })),

    changeLongitude: (newLongitude) =>
      set(({ GNSS, latitude, height, elevationCutoff, selectedSatellites }) => {
        const sky = calculateSkyPositions(GNSS, latitude, newLongitude, height);
        const DOP = calculateDOP(GNSS, sky, latitude, newLongitude, height, elevationCutoff, selectedSatellites);

        return {
          longitude: newLongitude,
          sky,
          DOP
        };
      }),

    changeHeight: (newHeight) =>
      set(({ GNSS, latitude, longitude, elevationCutoff, selectedSatellites }) => {
        const sky = calculateSkyPositions(GNSS, latitude, longitude, newHeight);
        const DOP = calculateDOP(GNSS, sky, latitude, longitude, newHeight, elevationCutoff, selectedSatellites);

        return {
          height: newHeight,
          sky,
          DOP
        };
      }),

    changeElevationCutoff: (newElevationCutoff) =>
      set(({ GNSS, latitude, longitude, height, selectedSatellites }) => {
        const sky = calculateSkyPositions(GNSS, latitude, longitude, height);
        const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, newElevationCutoff, selectedSatellites);

        return {
          elevationCutoff: newElevationCutoff,
          sky,
          DOP
        };
      }),

    changeSelectedTocs: (newSelectedTocs) =>
      set(({ navigationFile, latitude, longitude, height, elevationCutoff, selectedSatellites }) => {
        if (navigationFile === null) return { selectedTocs: newSelectedTocs };
        const GNSS = calculateSatellitePositions(navigationFile.content, newSelectedTocs);
        const GNSSGeocentric = calculateSatellitePositionsGeocentric(GNSS);
        const sky = calculateSkyPositions(GNSS, latitude, longitude, height);
        const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, elevationCutoff, selectedSatellites);

        return {
          selectedTocs: newSelectedTocs,
          GNSS,
          GNSSGeocentric,
          sky,
          DOP
        };
      }),

    changeLatitude: (newLatitude) =>
      set(({ GNSS, longitude, height, elevationCutoff, selectedSatellites }) => {
        const sky = calculateSkyPositions(GNSS, newLatitude, longitude, height);
        const DOP = calculateDOP(GNSS, sky, newLatitude, longitude, height, elevationCutoff, selectedSatellites);

        return {
          latitude: newLatitude,
          sky,
          DOP
        };
      }),

    changeSelectedSatellites: (newSelectedSatellites) =>
      set(({ GNSS, latitude, longitude, height, elevationCutoff }) => {
        const orderedSatellites = orderNewSelectedSatellites(newSelectedSatellites);
        const sky = calculateSkyPositions(GNSS, latitude, longitude, height);
        const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, elevationCutoff, orderedSatellites);

        return {
          selectedSatellites: orderedSatellites,
          sky,
          DOP
        };
      }),
  }
}));

export const useNavigationActions = () => useZustand(useNavigationStore, (state) => state.actions);
export const useNavigationFile = () => useZustand(useNavigationStore, (state) => state.navigationFile);
export const useGNSS = () => useZustand(useNavigationStore, (state) => state.GNSS);
export const useGNSSGeocentric = () => useZustand(useNavigationStore, (state) => state.GNSSGeocentric);
export const useSky = () => useZustand(useNavigationStore, (state) => state.sky);
export const useDOP = () => useZustand(useNavigationStore, (state) => state.DOP);
export const useTime = () => useZustand(useNavigationStore, (state) => state.time);
export const useLatitude = () => useZustand(useNavigationStore, (state) => state.latitude);
export const useLongitude = () => useZustand(useNavigationStore, (state) => state.longitude);
export const useHeight = () => useZustand(useNavigationStore, (state) => state.height);
export const useElevationCutoff = () => useZustand(useNavigationStore, (state) => state.elevationCutoff);
export const useSelectedTocs = () => useZustand(useNavigationStore, (state) => state.selectedTocs);
export const useSelectedSatellites = () => useZustand(useNavigationStore, (state) => state.selectedSatellites);
