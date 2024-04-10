import type { DOPList, SatellitePath, SatellitePathGeocentric, SkyPath } from "@/constants/types";
import {
	calculateDOP,
	calculateSatellitePositions,
	calculateSatellitePositionsGeocentric,
	calculateSkyPositions
} from "@/services/astronomy";
import dayjs, { type Dayjs } from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { createStore } from 'zustand/vanilla';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("UTC")


type Store = {
	latitude: number
	changeLatitude: (newLatitude: number) => void
	longitude: number
	changeLongitude: (newLongitude: number) => void
	height: number
	changeHeight: (newHeight: number) => void
	elevationCutoff: number
	changeElevationCutoff: (newElevationCutoff: number) => void
	date: Dayjs
	changeDate: (newDate: Dayjs) => void
	time: number
	changeTime: (newTime: number) => void
	almanacName: string
	changeAlmanacName: (newAlmanacName: string) => void
	almanac: Map<number, number[]>
	changeAlmanac: (newAlmanac: Map<number, number[]>) => void
	selectedSatellites: Set<number>
	changeSelectedSatellites: (newSelectedSatellites: Set<number>) => void
	selectedSatellitesNames: Set<string>
	GNSS: SatellitePath
	GNSSGeocentric: SatellitePathGeocentric
	sky: SkyPath
	DOP: DOPList
}

const useStore = createStore<Store>((set) => ({
	date: dayjs().startOf("day"),
	almanacName: "",
	almanac: new Map<number, number[]>(),
	GNSS: new Map<number, [number, number, number][]>(),
	GNSSGeocentric: new Map<number, [number, number][]>(),
	latitude: 0,
	longitude: 0,
	height: 480,
	elevationCutoff: 7,
	selectedSatellites: new Set<number>(),
	selectedSatellitesNames: new Set<string>(),
	sky: new Map<number, [number | undefined, number][]>(),
	DOP: new Array<[number, number, number, number, number]>(),
	time: 72,

	changeAlmanacName: (newAlmanacName) => set(() => ({ almanacName: newAlmanacName })),

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
		set(({ almanac, latitude, longitude, height, elevationCutoff, selectedSatellites }) => {
			const GNSS = calculateSatellitePositions(almanac, newDate)
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

	changeAlmanac: (newAlmanac) =>
		set(({ date, latitude, longitude, height, elevationCutoff, selectedSatellites }) => {

			const GNSS = calculateSatellitePositions(newAlmanac, date)
			const GNSSGeocentric = calculateSatellitePositionsGeocentric(GNSS)
			const sky = calculateSkyPositions(GNSS, latitude, longitude, height)
			const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, elevationCutoff, selectedSatellites)

			return {
				almanac: newAlmanac,
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

}))

export default useStore
