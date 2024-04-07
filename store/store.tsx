import dayjs, { Dayjs } from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import * as math from 'mathjs';
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
): SatellitePath {
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
): SkyPath {
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

function calculateDOP(GNSS: SatellitePath, skyTrace: SkyPath, latitude: number, longitude: number, height: number, elevationCutoff: number) {
	const intervals = 145
	const GNSS_DOP: [number, number, number, number][] = []


	for (let timeIncrement = 0; timeIncrement < intervals; timeIncrement++) {

		const a = 6378137
		const b = 6356752.3142
		const eSquared = 1 - (b * b) / (a * a)

		const latitudeRad = latitude * Math.PI / 180
		const longitudeRad = longitude * Math.PI / 180

		const N = a / Math.sqrt(1 - eSquared * Math.sin(latitudeRad) * Math.sin(latitudeRad))

		const xObserver = (N + height) * Math.cos(latitudeRad) * Math.cos(longitudeRad)
		const yObserver = (N + height) * Math.cos(latitudeRad) * Math.sin(longitudeRad)
		const zObserver = ((1 - eSquared) * (N + height)) * Math.sin(latitudeRad)

		let A = math.matrix([[]]);
		A.resize([1, 4]);


		for (let satelliteNumber = 2; satelliteNumber <= 32; satelliteNumber++) {
			if (!GNSS.has(satelliteNumber)) continue
			const satelliteData = GNSS.get(satelliteNumber)
			if (satelliteData === undefined) continue
			const satellitePosition = satelliteData[timeIncrement]
			if (satellitePosition === undefined) continue
			const [x, y, z] = satellitePosition
			if (x === undefined || y === undefined || z === undefined) continue
			const skyPositions = skyTrace.get(satelliteNumber)
			if (skyPositions === undefined) continue
			const skyLocation = skyPositions[timeIncrement]
			if (skyLocation === undefined) continue
			if (skyLocation[0] === undefined) continue
			const elevation = skyLocation[0]
			if (elevation < elevationCutoff) continue


			const xGeocentric = x - xObserver;
			const yGeocentric = y - yObserver;
			const zGeocentric = z - zObserver;

			const rGeocentric = Math.sqrt(
				xGeocentric ** 2 + yGeocentric ** 2 + zGeocentric ** 2
			);
			if (rGeocentric === 0) continue

			const distanceToObserver = Math.sqrt(
				xGeocentric ** 2 + yGeocentric ** 2 + zGeocentric ** 2
			);
			if (distanceToObserver === 0) continue

			const newRow = math.matrix([[-(xGeocentric / distanceToObserver), -(yGeocentric / distanceToObserver), -(zGeocentric / distanceToObserver), 1]]);
			newRow.resize([1, 4])
			A = math.concat(A, newRow, 0) as math.Matrix;
		}
		const sizeOfA = A.size()
		if (!sizeOfA[0]) continue
		A = math.subset(A, math.index(math.range(1, sizeOfA[0]), math.range(0, 4)))
		const Atranspose = math.transpose(A)
		const QnotInverted = math.multiply(Atranspose, A)

		const Q = math.inv(QnotInverted)

		const qx = Q.get([0, 0])
		const qy = Q.get([1, 1])
		const qz = Q.get([2, 2])
		const qt = Q.get([3, 3])

		const PDOP = Math.sqrt(qx + qy + qz)
		const TDOP = Math.sqrt(qt)

		Q.resize([3, 3])

		const Rneu = math.matrix([[-(math.sin(latitudeRad) * math.cos(longitudeRad)), -(math.sin(latitudeRad) * math.sin(longitudeRad)), math.cos(latitudeRad)], [-(math.sin(longitudeRad)), math.cos(longitudeRad), 0], [-(math.cos(latitudeRad) * math.cos(longitudeRad)), -(math.cos(latitudeRad) * math.sin(longitudeRad)), -math.sin(latitudeRad)]])
		const Qneu = math.multiply(math.multiply(math.transpose(Rneu), Q), Rneu)
		const qn = Qneu.get([0, 0])
		const qe = Qneu.get([1, 1])
		const qu = Qneu.get([2, 2])

		const HDOP = Math.sqrt(qn + qe)
		const VDOP = Math.sqrt(qu)
		GNSS_DOP.push([TDOP, PDOP, VDOP, HDOP])
	}
	return GNSS_DOP
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
	selectedSatellites: number[]
	changeSelectedSatellites: (newSelectedSatellites: number[]) => void
	GNSS: SatellitePath
	sky: SkyPath
	DOP: Array<[number, number, number, number]>
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
	selectedSatellites: [],
	sky: new Map<number, [number | undefined, number][]>(),
	DOP: new Array<[number, number, number, number]>(),
	time: 72,

	changeDate: (newDate) =>
		set(({ almanac, latitude, longitude, height, elevationCutoff }) => {

			const GNSS = calculateSatellitePositions(almanac, newDate)
			const sky = calculateSkyPositions(
				GNSS,
				latitude,
				longitude,
				height
			)
			const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, elevationCutoff)

			return {
				date: newDate,
				GNSS,
				sky,
				DOP
			};
		}
		),

	changeAlmanacName: (newAlmanacName) =>
		set(() => ({ almanacName: newAlmanacName })),

	changeAlmanac: (newAlmanac) =>
		set(({ date, latitude, longitude, height, elevationCutoff }) => {

			const GNSS = calculateSatellitePositions(newAlmanac, date)
			const sky = calculateSkyPositions(
				GNSS,
				latitude,
				longitude,
				height
			)
			const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, elevationCutoff)
			return {
				almanac: newAlmanac,
				GNSS,
				sky,
				DOP
			};
		}
		),

	changeLatitude: (newLatitude) =>
		set(({ GNSS, longitude, height, elevationCutoff }) => {
			const sky = calculateSkyPositions(
				GNSS,
				newLatitude,
				longitude,
				height
			)
			const DOP = calculateDOP(GNSS, sky, newLatitude, longitude, height, elevationCutoff)
			return {
				latitude: newLatitude,
				sky,
				DOP
			};
		}
		),

	changeLongitude: (newLongitude) =>
		set(({ GNSS, latitude, height, elevationCutoff }) => {
			const sky = calculateSkyPositions(
				GNSS,
				latitude,
				newLongitude,
				height
			)
			const DOP = calculateDOP(GNSS, sky, latitude, newLongitude, height, elevationCutoff)
			return {
				longitude: newLongitude,
				sky,
				DOP
			};
		}
		),

	changeHeight: (newHeight) =>
		set(({ GNSS, latitude, longitude, elevationCutoff }) => {
			const sky = calculateSkyPositions(
				GNSS,
				latitude,
				longitude,
				newHeight
			)
			const DOP = calculateDOP(GNSS, sky, latitude, longitude, newHeight, elevationCutoff)
			return {
				height: newHeight,
				sky,
				DOP
			};
		}
		),

	changeElevationCutoff: (newElevationCutoff) =>
		set(({ GNSS, latitude, longitude, height }) => {
			const sky = calculateSkyPositions(
				GNSS,
				latitude,
				longitude,
				height
			)
			const DOP = calculateDOP(GNSS, sky, latitude, longitude, height, newElevationCutoff)
			return {
				elevationCutoff: newElevationCutoff,
				sky,
				DOP
			};
		}
		),

	changeTime: (newTime) => set(() => ({ time: newTime })),

	changeSelectedSatellites: (newSelectedSatellites) => set(() => ({ selectedSatellites: newSelectedSatellites
	})),

	}))

export default useStore
