import dayjs, { Dayjs } from 'dayjs';
import { create } from 'zustand';


type SatellitePath = Map<number, [number, number, number][]>
type SkyPath = Map<number, Map<number, [number, number]>>

// const GPS = {
//     1: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
// } as const satisfies SatellitePath

// const sky = {
//     1: [[0, 0], [0, 0], [0, 0], [0, 0]],
// } as const satisfies SkyPath


const mi = 3.986005 * 1e14
const wE = 7.2921151467 * 1e-5


function parseCoordinate(coordString: string) {
  const matches = coordString.match(/^([NSWE])\s(\d+)°\s(\d+)'?\s([\d.]+)"?$/);
  if (!matches) {
    throw new Error(`Invalid coordinate format: ${coordString}`);
  }

  const direction = matches[1];
  const degrees = parseFloat(matches[2] as string);
  const minutes = parseFloat(matches[3] as string);
  const seconds = parseFloat(matches[4] as string);

  let decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);

  if (direction === 'S' || direction === 'W') {
    decimalDegrees = -decimalDegrees;
  }

  return decimalDegrees;
}

function timeSinceAlmanac(t: number, toa: number) {
  return t - toa
}

function meanMotionOfOrbit(a0: number) {
  if (a0 === 0) {
    throw new Error('Semi-major axis cannot be zero')
  }
  return Math.sqrt(mi / a0 ** 3)
}

function meanAnomalyOfOrbit(M0: number, n: number, tk: number) {
  return M0 + n * tk
}

function eccentricAnomalyOfOrbit(e: number, Mk: number, E: number = Mk, iteration = 0): number {
  if (Math.abs(E - Mk) < 1e-12) {
    return E;
  }

  const newE = Mk + e * Math.sin(E);
  return eccentricAnomalyOfOrbit(e, Mk, newE, iteration + 1);
}

function trueAnomalyOfOrbit(e: number, Ek: number) {
  return Math.atan2(Math.sqrt(1 - e ** 2) * Math.sin(Ek), Math.cos(Ek) - e)
}

function argumentOfPerigeeOfOrbit(vk: number, omega: number) {
  return vk - omega
}

function radiusOfOrbit(a: number, e: number, Ek: number) {
  return a * (1 - e * Math.cos(Ek))
}

function positionInOrbit(rk: number, psi: number): [number, number] {
  const xk: number = rk * Math.cos(psi)
  const yk: number = rk * Math.sin(psi)
  return [xk, yk]
}

function ascendingNodeOfOrbit(Omega0: number, Omega: number, tk: number, toa: number) {
  return Omega0 + (Omega - wE) * tk - wE * toa
}

function positionInECEF(xk: number, yk: number, OmegaK: number, inc: number): [number, number, number] {
  const x: number = xk * Math.cos(OmegaK) - yk * Math.cos(inc) * Math.sin(OmegaK)
  const y: number = xk * Math.sin(OmegaK) + yk * Math.cos(inc) * Math.cos(OmegaK)
  const z: number = yk * Math.sin(inc)
  return [x, y, z]
}

function calculateSatellitePositions(almanac: Map<number, number[]>, date: dayjs.Dayjs) {
  const output = new Map<number, [number, number, number][]>();
  const intervals = 145;
  const intervalMinutes = 10;

  const entries = Array.from(almanac.entries());

  for (const [satellite, satelliteData] of entries) {
    const positions: [number, number, number][] = [];

    const health = satelliteData[0];
    const e = satelliteData[1];
    const toa = satelliteData[6];
    const inc = satelliteData[7];
    const Omega = satelliteData[8];
    const sqrtA = satelliteData[2];
    const Omega0 = satelliteData[3];
    const omega = satelliteData[4];
    const M0 = satelliteData[5];

    if (health === undefined || e === undefined || toa === undefined || inc === undefined || Omega === undefined || sqrtA === undefined || Omega0 === undefined || omega === undefined || M0 === undefined) {
      continue;
    }

    const a = sqrtA ** 2;

    if (health === 0) {
      for (let i = 0; i < intervals; i++) {
        const t = date.add(i * intervalMinutes, 'minute').diff(date.startOf('week'), 'second');
        const tk = timeSinceAlmanac(t, toa);
        const n = meanMotionOfOrbit(a);
        const Mk = meanAnomalyOfOrbit(M0 * Math.PI / 180, n, tk);
        const E = eccentricAnomalyOfOrbit(e, Mk);
        const vk = trueAnomalyOfOrbit(e, E);
        const psi = argumentOfPerigeeOfOrbit(vk, omega * Math.PI / 180);
        const rk = radiusOfOrbit(a, e, E);
        const [xk, yk] = positionInOrbit(rk, psi);
        const OmegaK = ascendingNodeOfOrbit(Omega0 * Math.PI / 180, Omega * Math.PI / 180, tk, toa);
        const [x, y, z] = positionInECEF(xk, yk, OmegaK, inc * Math.PI / 180);

        positions.push([x, y, z]);
      }
    }

    output.set(satellite, positions);
  }

  return output;
}

function calculateSkyPositions(GNSS: SatellitePath, latitude: string, longitude: string, height: number, elevationCutoff: number) {
  const output = new Map<number, Map<number, [number, number]>>();

  // Constants for WGS84
  const a = 6378137;
  const b = 6356752.3142;
  const eSquared = 1 - (b * b) / (a * a);

  const latitudeRad = Number(parseCoordinate(latitude)) * Math.PI / 180;
  const longitudeRad = Number(parseCoordinate(longitude)) * Math.PI / 180;

  const N = a / Math.sqrt(1 - eSquared * Math.sin(latitudeRad) * Math.sin(latitudeRad));
  const xObserver = (N + height) * Math.cos(latitudeRad) * Math.cos(longitudeRad);
  const yObserver = (N + height) * Math.cos(latitudeRad) * Math.sin(longitudeRad);
  const zObserver = ((1 - eSquared) * N + height) * Math.sin(latitudeRad);

  GNSS.forEach((satelliteData, satellite) => {
    const positions = new Map<number, [number, number]>();

    satelliteData.forEach(([x, y, z], timeIncrement) => {
      const xTopocentric = x - xObserver;
      const yTopocentric = y - yObserver;
      const zTopocentric = z - zObserver;

      const rTopocentric = Math.sqrt(xTopocentric ** 2 + yTopocentric ** 2 + zTopocentric ** 2);

      const elevation = Math.asin(zTopocentric / rTopocentric) * 180 / Math.PI;
      const azimuth = (Math.atan2(yTopocentric, xTopocentric) * 180 / Math.PI + 360) % 360;

      if (elevation > elevationCutoff) {
        positions.set(timeIncrement, [elevation, azimuth]);
      }
    });

    output.set(satellite, positions);
  });

  return output;
}

type Store = {
  latitude: number,
  changeLatitude: (newLatitude: number) => void
  longitude: number,
  changeLongitude: (newLongitude: number) => void
  height: number,
  changeHeight: (newHeight: number) => void
  elevationCutoff: number,
  changeElevationCutoff: (newElevationCutoff: number) => void
  date: Dayjs,
  changeDate: (newDate: Dayjs) => void
  time: number,
  changeTime: (newTime: number) => void
  almanacName: string,
  changeAlmanacName: (newAlmanacName: string) => void
  almanac: Map<number, number[]>,
  changeAlmanac: (newAlmanac: Map<number, number[]>) => void
  GNSS: SatellitePath,
  sky: SkyPath,
}

const useStore = create<Store>((set) => ({
  latitude: 0,
  changeLatitude: (newLatitude) => set(() => ({ latitude: newLatitude })),
  longitude: 0,
  changeLongitude: (newLongitude) => set(() => ({ longitude: newLongitude })),
  height: 480,
  changeHeight: (newHeight) => set(() => ({ height: newHeight })),
  elevationCutoff: 7,

  date: dayjs().startOf('day'),
  changeDate: (newDate) => set(() => ({ date: newDate })),
  time: 72,
  changeTime: (newTime) => set(() => ({ time: newTime })),

  GNSS: new Map([
    [2, Array.from({ length: 145 }, (_, index) => {
      const angle = (index / 145) * 2 * Math.PI;
      const xk = Math.sin(angle) * 100;
      const yk = Math.cos(angle) * 100;
      const OmegaK = 0;
      const inc = 0;
      const [x, y, z] = positionInECEF(xk, yk, OmegaK, inc);
      return [x, y, z] as [number, number, number];
    })],
    [3, Array.from({ length: 144 }, (_, index) => {
      const angle = (index / 144) * 2 * Math.PI;
      const xk = Math.sin(angle) * 200;
      const yk = Math.cos(angle) * 200;
      const OmegaK = 0;
      const inc = 0;
      const [x, y, z] = positionInECEF(xk, yk, OmegaK, inc);
      return [x, y, z] as [number, number, number];
    })],
    [4, Array.from({ length: 144 }, (_, index) => {
      const angle = (index / 144) * 2 * Math.PI;
      const xk = Math.sin(angle) * 300;
      const yk = Math.cos(angle) * 300;
      const OmegaK = 0;
      const inc = 0;
      const [x, y, z] = positionInECEF(xk, yk, OmegaK, inc);
      return [x, y, z] as [number, number, number];
    })]
  ]),
  almanacName: "",
  sky: new Map<number, Map<number, [number, number]>>(),
  changeAlmanacName: (newAlmanacName) => set(() => ({ almanacName: newAlmanacName })),
  almanac: new Map<number, number[]>(),
  changeAlmanac: (newAlmanac) => set(({ date }) =>
  ({
    almanac: newAlmanac, GNSS: calculateSatellitePositions(newAlmanac, date)
  })),
  changeElevationCutoff: (newElevationCutoff) => set(({ GNSS }) => ({ elevationCutoff: newElevationCutoff, sky: calculateSkyPositions(GNSS, "N 0° 0' 0", "E 0° 0' 0", 480, newElevationCutoff) })),
}));

export default useStore;
