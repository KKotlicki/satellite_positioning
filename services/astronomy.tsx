import { WGS84_EARTH_GRAVITATIONAL_PARAMETER, WGS84_EARTH_RADIUS_MAJOR, WGS84_EARTH_RADIUS_MINOR, WGS84_EARTH_ROTATION_RATE } from "@/global/constants";
import type { Almanac, DOPList, RinexNavigation, SatellitePath, SatellitePathGeocentric, SelectedSatellites, SkyPath } from "@/global/types";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import * as math from 'mathjs';


dayjs.extend(utc);

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

function findClosestToc(tocs: number[], targetToc: number): number {
  return tocs.reduce((prev, curr) =>
    Math.abs(curr - targetToc) < Math.abs(prev - targetToc) ? curr : prev
  );
}

function isRinexNavigationData(data: Almanac[string][number] | RinexNavigation[string][number]): data is RinexNavigation[string][number] {
  return 'af0' in data && 'af1' in data && 'af2' in data && 'IODE' in data;
}

function getSatelliteDataEntries(
  navigationData: Almanac | RinexNavigation
): [string, { [toc: number]: Almanac[string][number] | RinexNavigation[string][number] }][] {
  return Object.entries(navigationData);
}

function extractSatelliteData(
  satelliteData: { [toc: number]: Almanac[string][number] | RinexNavigation[string][number] },
  closestToc: number
) {
  const data = satelliteData[closestToc];
  if (!data) return null;

  const { e, sqrt_a, Omega0, omega, M0, i0, OmegaDot, toe } = data;

  if (![e, sqrt_a, Omega0, omega, M0, i0, OmegaDot, toe].every(val => val !== undefined)) {
    return null;
  }

  const {
    delta_n = 0, Cuc = 0, Cus = 0, Cic = 0, Cis = 0, Crc = 0, Crs = 0, IDOT = 0
  } = isRinexNavigationData(data) ? data : {};

  return { e, sqrt_a, Omega0, omega, M0, i0, OmegaDot, toe, delta_n, Cuc, Cus, Cic, Cis, Crc, Crs, IDOT };
}

export function calculateSatellitePositions(
  navigationData: Almanac | RinexNavigation,
  selectedTocs: number[]
): SatellitePath {
  const output: SatellitePath = {};

  for (const [prn, satelliteData] of getSatelliteDataEntries(navigationData)) {
    const tocs = Object.keys(satelliteData).map(Number);

    for (const t of selectedTocs) {
      const closestToc = findClosestToc(tocs, t);
      const data = extractSatelliteData(satelliteData, closestToc);

      if (!data) continue;

      const { e, sqrt_a, Omega0, omega, M0, i0, OmegaDot, toe, delta_n, Cuc, Cus, Cic, Cis, Crc, Crs, IDOT } = data;

      const tk = t - closestToc;
      const a = sqrt_a * sqrt_a;
      const n0 = Math.sqrt(WGS84_EARTH_GRAVITATIONAL_PARAMETER / (a * a * a));
      const n = n0 + delta_n;
      const Mk = meanAnomalyOfOrbit(M0, n, tk);
      const E = eccentricAnomalyOfOrbit(e, Mk);
      const vk = trueAnomalyOfOrbit(e, E);
      const psi = vk + omega;
      const psiSin2 = Math.sin(2 * psi);
      const psiCos2 = Math.cos(2 * psi);
      const deltaU = Cus * psiSin2 + Cuc * psiCos2;
      const deltaR = Crs * psiSin2 + Crc * psiCos2;
      const deltaI = Cis * psiSin2 + Cic * psiCos2;

      const u = psi + deltaU;
      const r = a * (1 - e * Math.cos(E)) + deltaR;
      const i = i0 + IDOT * tk + deltaI;

      const [xk, yk] = positionInOrbit(r, u);
      const OmegaK = ascendingNodeOfOrbit(Omega0, OmegaDot, tk, toe);
      const position = positionInECEF(xk, yk, OmegaK, i);

      if (!output[prn]) {
        output[prn] = {};
      }

      output[prn][t] = position;
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
