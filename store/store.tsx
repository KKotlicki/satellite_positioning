import dayjs, { Dayjs } from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { createStore } from 'zustand/vanilla';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("UTC")

type SatellitePath = Map<number, [number, number, number][]>
type SkyPath = Map<number, [number | undefined, number][]>

const mi = 3.986005e14
const wE = 7.2921151467e-5 * 180 / Math.PI

function timeSinceAlmanac(t: number, toa: number) {
	return t - toa
}

function meanMotionOfOrbit(a0: number) {
	if (a0 === 0) {
		throw new Error("Semi-major axis cannot be zero")
	}
	return Math.sqrt(mi / a0 ** 6) * 180 / Math.PI
}

function meanAnomalyOfOrbit(M0: number, n: number, tk: number) {
	return M0 + n * tk
}

function eccentricAnomalyOfOrbit(e: number, Mk: number) {
	let E = Mk
	let delta = 1
	while (delta > 1e-12) {
		const newE = Mk + e * Math.sin(E)
		delta = Math.abs(newE - E)
		E = newE
	}
	return E
}

function trueAnomalyOfOrbit(e: number, Ek: number) {
	return Math.atan2(Math.sqrt(1 - e ** 2) * Math.sin(Ek * Math.PI / 180), Math.cos(Ek * Math.PI / 180) - e) * 180 / Math.PI
}

function argumentOfPerigeeOfOrbit(vk: number, omega: number) {
	return vk + omega
}

function radiusOfOrbit(a: number, e: number, Ek: number) {
	return (a ** 2) * (1 - e * Math.cos(Ek * Math.PI / 180))
}

function positionInOrbit(rk: number, psi: number): [number, number] {
	const xk: number = rk * Math.cos(psi * Math.PI / 180)
	const yk: number = rk * Math.sin(psi * Math.PI / 180)
	return [xk, yk]
}

function ascendingNodeOfOrbit(
	Omega0: number,
	Omega: number,
	tk: number,
	toa: number
) {
	return Omega0 + (Omega - wE) * tk - wE * toa
}

function positionInECEF(
	xk: number,
	yk: number,
	OmegaK: number,
	inc: number
): [number, number, number] {
	const x =
		xk * Math.cos(OmegaK * Math.PI / 180) - yk * Math.cos(inc * Math.PI / 180) * Math.sin(OmegaK * Math.PI / 180)
	const y =
		xk * Math.sin(OmegaK * Math.PI / 180) + yk * Math.cos(inc * Math.PI / 180) * Math.cos(OmegaK * Math.PI / 180)
	const z = yk * Math.sin(inc * Math.PI / 180)
	return [x, y, z]
}

function calculateSatellitePositions(
	almanac: Map<number, number[]>,
	date: dayjs.Dayjs
) {
	const output = new Map<number, [number, number, number][]>()
	const intervals = 145
	const intervalMinutes = 10

	const entries = Array.from(almanac.entries())

	for (const [satellite, satelliteData] of entries) {
		const positions: [number, number, number][] = []

		const health = satelliteData[0]
		const e = satelliteData[1]
		const sqrtA = satelliteData[2]
		const Omega0 = satelliteData[3]
		const omega = satelliteData[4]
		const M0 = satelliteData[5]
		const toa = satelliteData[6]
		const inc = satelliteData[7]
		const Omega = satelliteData[8]

		if (
			health === undefined ||
			e === undefined ||
			toa === undefined ||
			inc === undefined ||
			Omega === undefined ||
			sqrtA === undefined ||
			Omega0 === undefined ||
			omega === undefined ||
			M0 === undefined
		) {
			continue
		}

		if (health === 0) {
			for (let i = 0; i < intervals; i++) {
				const t = date
					.add(i * intervalMinutes, "minute").diff(dayjs("2024-02-18").startOf("day"), "second")
				const tk = timeSinceAlmanac(t, toa)
				const n = meanMotionOfOrbit(sqrtA)
				const Mk = meanAnomalyOfOrbit(M0, n, tk)
				const E = eccentricAnomalyOfOrbit(e, Mk * Math.PI / 180) * 180 / Math.PI
				const vk = trueAnomalyOfOrbit(e, E)
				const psi = argumentOfPerigeeOfOrbit(vk, omega)
				const rk = radiusOfOrbit(sqrtA, e, E)
				const [xk, yk] = positionInOrbit(rk, psi)
				const OmegaK = ascendingNodeOfOrbit(
					Omega0,
					Omega / 1000,
					tk,
					toa
				)
				const [x, y, z] = positionInECEF(xk, yk, OmegaK, 54 + inc)

				positions.push([x, y, z])
			}
		}
		output.set(satellite, positions)
	}
	return output;
}

function calculateSkyPositions(
	GNSS: SatellitePath,
	latitude: number,
	longitude: number,
	height: number,
) {
	const output = new Map<number, [number | undefined, number][]>()

	// Constants for WGS84
	const a = 6378137
	const b = 6356752.3142
	const eSquared = 1 - (b * b) / (a * a)

	const latitudeRad = latitude * Math.PI / 180
	const longitudeRad = longitude * Math.PI / 180

	const N = a / Math.sqrt(1 - eSquared * Math.sin(latitudeRad) * Math.sin(latitudeRad))

	const xObserver = (N + height) * Math.cos(latitudeRad) * Math.cos(longitudeRad)

	const yObserver = (N + height) * Math.cos(latitudeRad) * Math.sin(longitudeRad)

	const zObserver = ((1 - eSquared) * N + height) * Math.sin(latitudeRad)

	GNSS.forEach((satelliteData, satellite) => {
		const positions: [number | undefined, number][] = []
		for (const [x, y, z] of satelliteData) {
			const xGeocentric = x - xObserver;
			const yGeocentric = y - yObserver;
			const zGeocentric = z - zObserver;

			const rGeocentric = Math.sqrt(
				xGeocentric ** 2 + yGeocentric ** 2 + zGeocentric ** 2
			);
			if (rGeocentric === 0) {
				positions.push([undefined, 0]);
			}
			const xTopocentric =
				-xGeocentric * Math.sin(latitudeRad) * Math.cos(longitudeRad) -
				yGeocentric * Math.sin(latitudeRad) * Math.sin(longitudeRad) +
				zGeocentric * Math.cos(latitudeRad);
			const yTopocentric =
				-xGeocentric * Math.sin(longitudeRad) + yGeocentric * Math.cos(longitudeRad);
			const zTopocentric =
				xGeocentric * Math.cos(latitudeRad) * Math.cos(longitudeRad) +
				yGeocentric * Math.cos(latitudeRad) * Math.sin(longitudeRad) +
				zGeocentric * Math.sin(latitudeRad);

			const elevation = (Math.asin(zTopocentric / rGeocentric) * 180) / Math.PI;
			const azimuth =
				((Math.atan2(yTopocentric, xTopocentric) * 180) / Math.PI + 360) % 360;
			positions.push([elevation, azimuth]);
		}

		output.set(satellite, positions);
	});

	return output;
}


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
	GNSS: SatellitePath
	sky: SkyPath
}

const useStore = createStore<Store>((set) => ({
	date: dayjs().startOf("day"),
	almanacName: "",
	almanac: new Map<number, number[]>(),
	GNSS: new Map<number, [number, number, number][]>(),
	latitude: 0,
	longitude: 0,
	height: 480,
	elevationCutoff: 7,
	sky: new Map<number, [number | undefined, number][]>(),
	time: 72,

	changeDate: (newDate) =>
		set(({ almanac, latitude, longitude, height }) => {

			const GNSS = calculateSatellitePositions(almanac, newDate)

			return {
				date: newDate,
				GNSS,
				sky: calculateSkyPositions(
					GNSS,
					latitude,
					longitude,
					height
				)
			};
		}
		),

	changeAlmanacName: (newAlmanacName) =>
		set(() => ({ almanacName: newAlmanacName })),

	changeAlmanac: (newAlmanac) =>
		set(({ date, latitude, longitude, height }) => {

			const GNSS = calculateSatellitePositions(newAlmanac, date)

			return {
				almanac: newAlmanac,
				GNSS,
				sky: calculateSkyPositions(
					GNSS,
					latitude,
					longitude,
					height
				)
			};
		}
		),

	changeLatitude: (newLatitude) =>
		set(({ GNSS, longitude, height }) => {
			return {
				latitude: newLatitude,
				sky: calculateSkyPositions(
					GNSS,
					newLatitude,
					longitude,
					height
				)
			};
		}
		),

	changeLongitude: (newLongitude) =>
		set(({ GNSS, latitude, height }) => {
			return {
				longitude: newLongitude,
				sky: calculateSkyPositions(
					GNSS,
					latitude,
					newLongitude,
					height
				)
			};
		}
		),

	changeHeight: (newHeight) =>
		set(({ GNSS, latitude, longitude }) => {
			return {
				height: newHeight,
				sky: calculateSkyPositions(
					GNSS,
					latitude,
					longitude,
					newHeight
				)
			};
		}
		),

	changeElevationCutoff: (newElevationCutoff) =>
		set(({ GNSS, latitude, longitude, height }) => {
			return {
				elevationCutoff: newElevationCutoff,
				sky: calculateSkyPositions(
					GNSS,
					latitude,
					longitude,
					height
				)
			};
		}
		),

	changeTime: (newTime) => set(() => ({ time: newTime })),
}))

export default useStore
