import { WGS84_EARTH_GRAVITATIONAL_PARAMETER, WGS84_EARTH_RADIUS_MAJOR, WGS84_EARTH_RADIUS_MINOR, WGS84_EARTH_ROTATION_RATE } from "@/global/constants";
import type { Almanac, DOPList, RinexNavigation, SatellitePath, SatellitePathGeocentric, SelectedSatellites, SkyPath } from "@/global/types";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import * as math from 'mathjs';


dayjs.extend(utc);

function meanMotionOfOrbit(sqrtA: number) {
  if (sqrtA === 0) throw new Error("Semi-major axis cannot be zero");
  const a = sqrtA ** 2;
  return Math.sqrt(WGS84_EARTH_GRAVITATIONAL_PARAMETER / (a * a * a));
}

const meanAnomalyOfOrbit = (M0: number, n: number, tk: number) => M0 + n * tk;
function eccentricAnomalyOfOrbit(e: number, Mk: number) {
  let E = Mk;
  let delta = 1;
  while (delta > 1e-12) {
    const newE = Mk + e * Math.sin(E);
    delta = Math.abs(newE - E);
    E = newE;
  }
  return E;
}

const trueAnomalyOfOrbit = (e: number, Ek: number) =>
  Math.atan2(Math.sqrt(1 - e ** 2) * Math.sin(Ek),
    Math.cos(Ek) - e);

const argumentOfPerigeeOfOrbit = (vk: number, omega: number) => vk + omega;
const radiusOfOrbit = (a: number, e: number, Ek: number) => a * (1 - e * Math.cos(Ek));

const positionInOrbit = (rk: number, psi: number): [number, number] => ([
  rk * Math.cos(psi),
  rk * Math.sin(psi)
]);

const ascendingNodeOfOrbit = (Omega0: number, Omega: number, tk: number, toe: number) =>
  Omega0 + (Omega - WGS84_EARTH_ROTATION_RATE) * tk - WGS84_EARTH_ROTATION_RATE * toe;

const positionInECEF = (
  xk: number,
  yk: number,
  OmegaK: number,
  inc: number
): { x: number, y: number, z: number } => ({
  x: xk * Math.cos(OmegaK) - yk * Math.cos(inc) * Math.sin(OmegaK),
  y: xk * Math.sin(OmegaK) + yk * Math.cos(inc) * Math.cos(OmegaK),
  z: yk * Math.sin(inc)
});

export function calculateSatellitePositions(
  navigationData: Almanac | RinexNavigation,
  selectedTocs: number[]
): SatellitePath {
  const output: SatellitePath = {};

  for (const [prn, satelliteData] of Object.entries(navigationData)) {
    for (const [tocStr, data] of Object.entries(satelliteData)) {
      const e = data.e;
      const sqrtA = data.sqrt_a;
      const Omega0 = data.Omega0;
      const omega = data.omega;
      const M0 = data.M0;
      const inc = data.i0;
      const Omega = data.OmegaDot;
      const toe = data.toe;

      if (
        e === undefined ||
        sqrtA === undefined ||
        Omega0 === undefined ||
        omega === undefined ||
        M0 === undefined ||
        inc === undefined ||
        Omega === undefined ||
        toe === undefined
      ) {
        continue;
      }

      const toc = Number(tocStr);

      if (!output[prn]) {
        output[prn] = {};
      }

      for (const t of selectedTocs) {
        const tk = t - toc;
        const n = meanMotionOfOrbit(sqrtA);
        const Mk = meanAnomalyOfOrbit(M0, n, tk);
        const E = eccentricAnomalyOfOrbit(e, Mk);
        const vk = trueAnomalyOfOrbit(e, E);
        const psi = argumentOfPerigeeOfOrbit(vk, omega);
        const rk = radiusOfOrbit(sqrtA * sqrtA, e, E);
        const [xk, yk] = positionInOrbit(rk, psi);
        const OmegaK = ascendingNodeOfOrbit(Omega0, Omega, tk, toe);
        const position = positionInECEF(xk, yk, OmegaK, inc);

        output[prn][t] = position;
      }
    }
  }

  return output;
}



export function calculateSatellitePositionsGeocentric(
  GNSS: SatellitePath
): SatellitePathGeocentric {
  const output: SatellitePathGeocentric = {};

  for (const [prn, satelliteData] of Object.entries(GNSS)) {
    output[prn] = {};
    for (const [tocStr, { x, y, z }] of Object.entries(satelliteData)) {
      const toc = Number(tocStr);
      const r = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      const latitude = Math.asin(z / r) * 180 / Math.PI;
      const longitude = Math.atan2(y, x) * 180 / Math.PI;
      output[prn][toc] = { latitude, longitude };
    }
  }

  return output;
}

export function calculateSkyPositions(
  GNSS: SatellitePath,
  latitude: number,
  longitude: number,
  height: number
): SkyPath {
  const output: SkyPath = {};

  const a = WGS84_EARTH_RADIUS_MAJOR;
  const b = WGS84_EARTH_RADIUS_MINOR;
  const eSquared = 1 - (b * b) / (a * a);

  const latitudeRad = latitude * (Math.PI / 180);
  const longitudeRad = longitude * (Math.PI / 180);

  const N = a / Math.sqrt(1 - eSquared * Math.sin(latitudeRad) * Math.sin(latitudeRad));
  const xObserver = (N + height) * Math.cos(latitudeRad) * Math.cos(longitudeRad);
  const yObserver = (N + height) * Math.cos(latitudeRad) * Math.sin(longitudeRad);
  const zObserver = ((1 - eSquared) * N + height) * Math.sin(latitudeRad);

  for (const [prn, satelliteData] of Object.entries(GNSS)) {
    output[prn] = {};
    for (const [tocStr, { x, y, z }] of Object.entries(satelliteData)) {
      const toc = Number(tocStr);

      const xGeocentric = x - xObserver;
      const yGeocentric = y - yObserver;
      const zGeocentric = z - zObserver;

      const rGeocentric = Math.sqrt(
        xGeocentric ** 2 + yGeocentric ** 2 + zGeocentric ** 2
      );

      const xEast = -Math.sin(longitudeRad) * xGeocentric + Math.cos(longitudeRad) * yGeocentric;
      const yNorth = -Math.sin(latitudeRad) * Math.cos(longitudeRad) * xGeocentric
        - Math.sin(latitudeRad) * Math.sin(longitudeRad) * yGeocentric
        + Math.cos(latitudeRad) * zGeocentric;
      const zUp = Math.cos(latitudeRad) * Math.cos(longitudeRad) * xGeocentric
        + Math.cos(latitudeRad) * Math.sin(longitudeRad) * yGeocentric
        + Math.sin(latitudeRad) * zGeocentric;

      const elevation = Math.asin(zUp / rGeocentric);
      const azimuth = (Math.atan2(xEast, yNorth) + 2 * Math.PI) % (2 * Math.PI);

      output[prn][toc] = { elevation, azimuth };
    }
  }

  return output;
}

export function calculateDOP(
  GNSS: SatellitePath,
  skyTrace: SkyPath,
  latitude: number,
  longitude: number,
  height: number,
  elevationCutoff: number,
  selectedSatellites: SelectedSatellites
): DOPList {
  const GNSS_DOP: DOPList = {};

  const a = WGS84_EARTH_RADIUS_MAJOR;
  const b = WGS84_EARTH_RADIUS_MINOR;
  const eSquared = 1 - (b * b) / (a * a);

  const latitudeRad = latitude * Math.PI / 180;
  const longitudeRad = longitude * Math.PI / 180;

  const N = a / Math.sqrt(1 - eSquared * Math.sin(latitudeRad) * Math.sin(latitudeRad));

  const xObserver = (N + height) * Math.cos(latitudeRad) * Math.cos(longitudeRad);
  const yObserver = (N + height) * Math.cos(latitudeRad) * Math.sin(longitudeRad);
  const zObserver = ((1 - eSquared) * N + height) * Math.sin(latitudeRad);

  const selectedSatellitesList = Object.entries(selectedSatellites).flatMap(([, prns]) =>
    Object.entries(prns).filter(([, details]) => details.isSelected).map(([prn]) => prn)
  );

  const tocs: number[] = [];
  for (const prn in GNSS) {
    if (!Object.prototype.hasOwnProperty.call(GNSS, prn)) continue;
    const satelliteData = GNSS[prn];
    for (const tocStr in satelliteData) {
      if (!Object.prototype.hasOwnProperty.call(satelliteData, tocStr)) continue;
      const toc = Number(tocStr);
      if (Number.isNaN(toc)) continue;
      tocs.push(toc);
    }
  }
  const uniqueTocs = Array.from(new Set(tocs)).sort((a, b) => a - b);

  for (const toc of uniqueTocs) {
    let A = math.matrix([[]]);
    A.resize([1, 4]);

    if (selectedSatellitesList.length < 4) {
      GNSS_DOP[toc] = { TDOP: -1, PDOP: -1, VDOP: -1, HDOP: -1 };
      continue;
    }

    for (const satellitePRN of selectedSatellitesList) {
      if (!GNSS[satellitePRN]) continue;
      const satelliteData = GNSS[satellitePRN];
      const satellitePosition = satelliteData[toc];
      if (!satellitePosition) continue;
      const { x, y, z } = satellitePosition;
      if (x === undefined || y === undefined || z === undefined) continue;
      const skyPositions = skyTrace[satellitePRN];
      if (!skyPositions) continue;
      const skyLocation = skyPositions[toc];
      if (!skyLocation) continue;
      const elevation = skyLocation.elevation;
      if (elevation === undefined || elevation < elevationCutoff * Math.PI / 180) continue;

      const xGeocentric = x - xObserver;
      const yGeocentric = y - yObserver;
      const zGeocentric = z - zObserver;

      const distanceToObserver = Math.sqrt(
        xGeocentric ** 2 + yGeocentric ** 2 + zGeocentric ** 2
      );
      if (distanceToObserver === 0) continue;

      const newRow = math.matrix([[-(xGeocentric / distanceToObserver), -(yGeocentric / distanceToObserver), -(zGeocentric / distanceToObserver), 1]]);
      A = math.concat(A, newRow, 0) as math.Matrix;
    }

    const sizeOfA = A.size();
    const sizeOfA0 = sizeOfA[0];
    if (sizeOfA0 === undefined || sizeOfA0 <= 1) {
      GNSS_DOP[toc] = { TDOP: -1, PDOP: -1, VDOP: -1, HDOP: -1 };
      continue;
    }

    A = math.subset(A, math.index(math.range(1, sizeOfA0), math.range(0, 4)));
    const sizeOfASubset = A.size();
    const sizeOfASubset0 = sizeOfASubset[0];
    if (sizeOfASubset0 === undefined) {
      GNSS_DOP[toc] = { TDOP: -1, PDOP: -1, VDOP: -1, HDOP: -1 };
      continue;
    }
    if (sizeOfASubset0 < 4 || sizeOfASubset[1] !== 4) {
      GNSS_DOP[toc] = { TDOP: -1, PDOP: -1, VDOP: -1, HDOP: -1 };
      continue;
    }

    const Atranspose = math.transpose(A);
    const QnotInverted = math.multiply(Atranspose, A);

    const det = math.det(QnotInverted);
    if (det === 0) {
      GNSS_DOP[toc] = { TDOP: -1, PDOP: -1, VDOP: -1, HDOP: -1 };
      continue;
    }

    const Q = math.inv(QnotInverted);

    const qx = Q.get([0, 0]);
    const qy = Q.get([1, 1]);
    const qz = Q.get([2, 2]);
    const qt = Q.get([3, 3]);

    const PDOP = Math.sqrt(qx + qy + qz);
    const TDOP = Math.sqrt(qt);

    Q.resize([3, 3]);

    const Rneu = math.matrix([
      [-(math.sin(latitudeRad) * math.cos(longitudeRad)), -(math.sin(latitudeRad) * math.sin(longitudeRad)), math.cos(latitudeRad)],
      [-(math.sin(longitudeRad)), math.cos(longitudeRad), 0],
      [-(math.cos(latitudeRad) * math.cos(longitudeRad)), -(math.cos(latitudeRad) * math.sin(longitudeRad)), -math.sin(latitudeRad)]
    ]);
    const Qneu = math.multiply(math.multiply(math.transpose(Rneu), Q), Rneu);
    const qn = Qneu.get([0, 0]);
    const qe = Qneu.get([1, 1]);
    const qu = Qneu.get([2, 2]);

    const HDOP = Math.sqrt(qn + qe);
    const VDOP = Math.sqrt(qu);

    if (PDOP > 100 || TDOP > 100 || HDOP > 100 || VDOP > 100) {
      GNSS_DOP[toc] = { TDOP: -1, PDOP: -1, VDOP: -1, HDOP: -1 };
      continue;
    }

    GNSS_DOP[toc] = { TDOP, PDOP, VDOP, HDOP };
  }

  return GNSS_DOP;
}
