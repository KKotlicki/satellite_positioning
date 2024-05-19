import type { Almanac, AstronomyFile, DOPList, SatellitePath, SatellitePathGeocentric, SkyPath } from "@/global/types";
import {
	calculateDOP,
	calculateSatellitePositions,
	calculateSatellitePositionsGeocentric,
	calculateSkyPositions
} from "@/services/astronomy";
import dayjs, { type Dayjs } from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useZustand } from "use-zustand";
import { createStore } from 'zustand/vanilla';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("UTC")


type AlmanacStore = {
	latitude: number
	longitude: number
	height: number
	elevationCutoff: number
	date: Dayjs
	time: number
	almanacFile: AstronomyFile<Almanac>
	selectedSatellites: Set<number>
	GNSS: SatellitePath
	GNSSGeocentric: SatellitePathGeocentric
	sky: SkyPath
	DOP: DOPList
	actions: {
		changeLatitude: (newLatitude: number) => void
		changeLongitude: (newLongitude: number) => void
		changeHeight: (newHeight: number) => void
		changeElevationCutoff: (newElevationCutoff: number) => void
		changeDate: (newDate: Dayjs) => void
		changeTime: (newTime: number) => void
		changeAlmanacFile: (newAlmanacFile: AstronomyFile<Almanac>) => void
		changeSelectedSatellites: (newSelectedSatellites: Set<number>) => void
	}
}

const useAlmanacStore = createStore<AlmanacStore>((set) => ({
	date: dayjs().startOf("day"),
	almanacFile: {
		name: "",
		extensions: ["alm"],
		fileName: null,
		content: null
	},
	GNSS: new Map(),
	GNSSGeocentric: new Map(),
	latitude: 0,
	longitude: 0,
	height: 480,
	elevationCutoff: 7,
	selectedSatellites: new Set<number>(),
	sky: new Map(),
	DOP: [],
	time: 72,

	actions:
	{

		changeAlmanacFile: (newAlmanacFile) =>
			set(({ date, latitude, longitude, height, elevationCutoff, selectedSatellites }) => {
				if (newAlmanacFile.content === null) return { almanacFile: newAlmanacFile }
				const GNSS = calculateSatellitePositions(newAlmanacFile.content, date)
				const GNSSGeocentric = calculateSatellitePositionsGeocentric(GNSS)
				const sky = calculateSkyPositions(GNSS, latitude, longitude, height)
				const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, elevationCutoff, selectedSatellites)

				return {
					almanacFile: newAlmanacFile,
					GNSS,
					GNSSGeocentric,
					sky,
					DOP
				}
			}),

		changeTime: (newTime) => set(() => ({ time: newTime })),

		changeLongitude: (newLongitude) =>
			set(({ GNSS, latitude, height, elevationCutoff, selectedSatellites }) => {
				const sky = calculateSkyPositions(GNSS, latitude, newLongitude, height)
				const DOP = calculateDOP(GNSS, sky, latitude, newLongitude, height, elevationCutoff, selectedSatellites)

				return {
					longitude: newLongitude,
					sky,
					DOP
				}
			}),

		changeHeight: (newHeight) =>
			set(({ GNSS, latitude, longitude, elevationCutoff, selectedSatellites }) => {
				const sky = calculateSkyPositions(GNSS, latitude, longitude, newHeight)
				const DOP = calculateDOP(GNSS, sky, latitude, longitude, newHeight, elevationCutoff, selectedSatellites)

				return {
					height: newHeight,
					sky,
					DOP
				}
			}),

		changeElevationCutoff: (newElevationCutoff) =>
			set(({ GNSS, latitude, longitude, height, selectedSatellites }) => {
				const sky = calculateSkyPositions(GNSS, latitude, longitude, height)
				const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, newElevationCutoff, selectedSatellites)

				return {
					elevationCutoff: newElevationCutoff,
					sky,
					DOP
				}
			}),

		changeDate: (newDate) =>
			set(({ almanacFile, latitude, longitude, height, elevationCutoff, selectedSatellites }) => {
				if (almanacFile.content === null) return { date: newDate }
				const GNSS = calculateSatellitePositions(almanacFile.content, newDate)
				const GNSSGeocentric = calculateSatellitePositionsGeocentric(GNSS)
				const sky = calculateSkyPositions(
					GNSS,
					latitude,
					longitude,
					height
				)
				const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, elevationCutoff, selectedSatellites)

				return {
					date: newDate,
					GNSS,
					GNSSGeocentric,
					sky,
					DOP
				}
			}),

		changeLatitude: (newLatitude) =>
			set(({ GNSS, longitude, height, elevationCutoff, selectedSatellites }) => {
				const sky = calculateSkyPositions(GNSS, newLatitude, longitude, height)
				const DOP = calculateDOP(GNSS, sky, newLatitude, longitude, height, elevationCutoff, selectedSatellites)

				return {
					latitude: newLatitude,
					sky,
					DOP
				}
			}),

		changeSelectedSatellites: (newSelectedSatellites) =>
			set(({ GNSS, latitude, longitude, height, elevationCutoff }) => {
				const sky = calculateSkyPositions(GNSS, latitude, longitude, height)
				const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, elevationCutoff, newSelectedSatellites)

				return {
					selectedSatellites: newSelectedSatellites,
					sky,
					DOP
				}
			}),
	}
}))

export const useAlmanacActions = () => useZustand(useAlmanacStore, (state) => state.actions);
export const useAlmanacFile = () => useZustand(useAlmanacStore, (state) => state.almanacFile);
export const useGNSS = () => useZustand(useAlmanacStore, (state) => state.GNSS);
export const useGNSSGeocentric = () => useZustand(useAlmanacStore, (state) => state.GNSSGeocentric);
export const useSky = () => useZustand(useAlmanacStore, (state) => state.sky);
export const useDOP = () => useZustand(useAlmanacStore, (state) => state.DOP);
export const useTime = () => useZustand(useAlmanacStore, (state) => state.time);
export const useLatitude = () => useZustand(useAlmanacStore, (state) => state.latitude);
export const useLongitude = () => useZustand(useAlmanacStore, (state) => state.longitude);
export const useHeight = () => useZustand(useAlmanacStore, (state) => state.height);
export const useElevationCutoff = () => useZustand(useAlmanacStore, (state) => state.elevationCutoff);
export const useDate = () => useZustand(useAlmanacStore, (state) => state.date);
export const useSelectedSatellites = () => useZustand(useAlmanacStore, (state) => state.selectedSatellites);
