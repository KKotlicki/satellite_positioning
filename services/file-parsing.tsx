import { PRN_GNSS } from "@/global/constants";
import type { Almanac, ObservationTypes, RinexMeteo, RinexNavigation, RinexObservation, RinexObservationBody, RinexObservationHeader } from "@/global/types";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);


export function parseAlmFile(input: string): Almanac {
  const initializeAlmanacEntry = (): Almanac[string][number] => {
    return {
      health: Number.NaN,
      e: Number.NaN,
      sqrt_a: Number.NaN,
      Omega0: Number.NaN,
      omega: Number.NaN,
      M0: Number.NaN,
      toe: Number.NaN,
      i0: Number.NaN,
      OmegaDot: Number.NaN,
      af0: Number.NaN,
      af1: Number.NaN,
      GPSWeek: Number.NaN,
    };
  };

  const satelliteIDToName = (satelliteID: string): string => {
    const id = Number(satelliteID);
    for (const key of PRN_GNSS) {
      if (key[1] <= id && id <= key[2]) {
        const adjustedID = id - key[1] + 1;
        return `${key[0]}${adjustedID < 10 ? '0' : ''}${adjustedID}`;
      }
    }
    return `S${satelliteID}`;
  };

  const lines = input.split("\n").filter(line => line.trim().length > 0);
  const alm: Almanac = {};
  const numRowsPerSat = 13;

  for (let chunkStart = 0; chunkStart < lines.length; chunkStart += numRowsPerSat) {
    const chunkEnd = chunkStart + numRowsPerSat;
    if (chunkEnd > lines.length) break;

    const chunkLines = lines.slice(chunkStart, chunkEnd);
    const chunkLine = chunkLines[0];
    if (!chunkLine) continue;
    const firstLineValues = chunkLine.match(/.{1,10}/g)?.map(val => val.trim()) || [];
    const numColumns = firstLineValues.length;

    for (let col = 0; col < numColumns; col++) {
      let prn: string | null = null;
      let toe: number | null = null;
      let gpsWeek: number | null = null;
      const entry = initializeAlmanacEntry();

      for (let row = 0; row < numRowsPerSat; row++) {
        const line = chunkLines[row];
        if (!line) continue;
        const values = line.match(/.{1,10}/g)?.map(val => val.trim()) || [];
        if (values.length <= col) continue;

        const valueStr = values[col];
        if (!valueStr) continue;
        const value = Number.parseFloat(valueStr);

        switch (row) {
          case 0: prn = satelliteIDToName(valueStr); break;
          case 1: entry.health = value; break;
          case 2: entry.e = value; break;
          case 3: entry.sqrt_a = value; break;
          case 4: entry.Omega0 = value * Math.PI / 180; break;
          case 5: entry.omega = value * Math.PI / 180; break;
          case 6: entry.M0 = value * Math.PI / 180; break;
          case 7: toe = value; break;
          case 8: entry.i0 = (value + 54) * Math.PI / 180; break;
          case 9: entry.OmegaDot = value * Math.PI / 180 / 1000; break;
          case 10: entry.af0 = value; break;
          case 11: entry.af1 = value; break;
          case 12: gpsWeek = value; break;
        }
      }

      if (!prn || toe == null || gpsWeek == null) continue;
      if (!alm[prn]) alm[prn] = {};
      const toc = toe + gpsWeek * 7 * 24 * 60 * 60;
      entry.toe = toe;
      entry.GPSWeek = gpsWeek;
      const currentSatellite = alm[prn]
      if (!currentSatellite) continue;
      currentSatellite[toc] = entry;
    }
  }

  return alm;
}

export function parseRnxNavigation(input: string): RinexNavigation {
  const keys: (keyof RinexNavigation[string][number])[] = [
    'af0', 'af1', 'af2', 'IODE', 'Crs', 'delta_n', 'M0',
    'Cuc', 'e', 'Cus', 'sqrt_a', 'toe', 'Cic', 'Omega0', 'Cis',
    'i0', 'Crc', 'omega', 'OmegaDot', 'IDOT', 'L2', 'GPSWeek',
    'L2P', 'accuracy', 'health', 'TGD', 'IODC', 'Tom'
  ];

  const initializeNavEntry = (keys: (keyof RinexNavigation[string][number])[]): RinexNavigation[string][number] => {
    return keys.reduce((acc, key) => {
      acc[key] = Number.NaN;
      return acc;
    }, {} as RinexNavigation[string][number]);
  };

  const lines = input.split('\n');
  const nav: RinexNavigation = {};
  let headerEnded = false;
  let currentPRN: string | null = null;
  let currentSatToc: RinexNavigation[string][number] = initializeNavEntry(keys);
  let currentToc: number | null = null;

  let m = 1;

  const parseToc = (line: string): number => {
    const year = Number(line.substring(4, 8).trim());
    const month = Number(line.substring(9, 11).trim());
    const day = Number(line.substring(12, 14).trim());
    const hour = Number(line.substring(15, 17).trim());
    const minute = Number(line.substring(18, 20).trim());
    const second = Number(line.substring(21, 23).trim());

    const date = dayjs.utc().set('year', year).set('month', month - 1).set('date', day).set('hour', hour).set('minute', minute).set('second', second);
    const gpsEpoch = dayjs.utc().set('year', 1980).set('month', 0).set('date', 6).set('hour', 0).set('minute', 0).set('second', 0);
    const tocInSeconds = date.diff(gpsEpoch, 'second');
    return tocInSeconds;
  };

  for (const line of lines) {
    if (!headerEnded) {
      if (line.includes('END OF HEADER')) {
        headerEnded = true;
      }
      continue;
    }

    if (m === 1) {
      currentPRN = line.substring(0, 3).replace(/D/g, 'E').trim();
      currentToc = parseToc(line);
      currentSatToc = initializeNavEntry(keys);
    }

    for (let j = 0; j < 4; j++) {
      if (m === 1 && j === 0) continue;
      const currentKey = keys[(m - 1) * 4 + j - 1];
      if (!currentKey) continue;
      currentSatToc[currentKey] = Number.parseFloat(line.substring(j * 19 + 4, 4 + (j + 1) * 19).trim());
    }

    if (m === 8) {
      if (!currentPRN || currentToc === null) continue;
      const storeToc = {} as RinexNavigation[string][number];
      for (const key of keys) {
        storeToc[key] = currentSatToc[key];
      }
      storeToc.toe = currentSatToc.toe;
      nav[currentPRN] = {
        ...nav[currentPRN],
        [currentToc]: storeToc,
      };
    }

    m = (m % 8) + 1;
  }

  const sortedPRNs = Object.keys(nav).sort((a, b) => {
    const order = 'GRJEC';
    const a0 = a[0];
    const b0 = b[0];
    if (a0 === undefined || b0 === undefined) return 0;
    const indexA = order.indexOf(a0);
    const indexB = order.indexOf(b0);
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    return Number.parseInt(a.substring(1)) - Number.parseInt(b.substring(1));
  });

  const sortedNav: RinexNavigation = {};
  for (const prn of sortedPRNs) {
    const navSatellite = nav[prn];
    if (navSatellite === undefined) continue;
    const sortedTocs = Object.keys(navSatellite).map(Number).sort((a, b) => a - b);
    sortedNav[prn] = {};
    const prnNav = sortedNav[prn];
    for (const toc of sortedTocs) {
      const navSatToc = navSatellite[toc];
      if (navSatToc === undefined) continue;
      prnNav[toc] = navSatToc;
    }
  }

  return sortedNav;
}

// export function parseRnxObservation(input: string): RinexObservation {
//   return {
//     test: [Number(input)],
//   }
// }

export function parseRnxObservation(input: string): RinexObservation {
  const lines = input.split('\n');
  let headerEnded = false;
  const header: RinexObservationHeader = {
    approxPositionXYZ: { x: 0, y: 0, z: 0 },
    antennaDelta: { h: 0, e: 0, n: 0 },
    observationTypes: {},
    interval: 0,
    tocOfFirstObs: 0,
    phaseShifts: {},
    signalStrengthUnit: '',
    glonassSlotFrequencies: {}
  };
  const body: RinexObservationBody = {};
  let currentEpoch = 0;

  const parseToc = (line: string): number => {
    const year = Number(line.substring(2, 6).trim());
    const month = Number(line.substring(7, 9).trim());
    const day = Number(line.substring(10, 12).trim());
    const hour = Number(line.substring(13, 15).trim());
    const minute = Number(line.substring(16, 18).trim());
    const second = Number(line.substring(19, 29).trim());

    const date = dayjs.utc().set('year', year).set('month', month - 1).set('date', day).set('hour', hour).set('minute', minute).set('second', second);
    const gpsEpoch = dayjs.utc().set('year', 1980).set('month', 0).set('date', 6).set('hour', 0).set('minute', 0).set('second', 0);
    const tocInSeconds = date.diff(gpsEpoch, 'second');
    return tocInSeconds;
  };

  for (let line of lines) {
    if (!headerEnded) {
      if (line.includes('END OF HEADER')) {
        headerEnded = true;
      } else {
        // Parse header lines
        if (line.includes('APPROX POSITION XYZ')) {
          header.approxPositionXYZ.x = Number.parseFloat(line.substring(0, 14).trim());
          header.approxPositionXYZ.y = Number.parseFloat(line.substring(14, 28).trim());
          header.approxPositionXYZ.z = Number.parseFloat(line.substring(28, 42).trim());
        } else if (line.includes('ANTENNA: DELTA H/E/N')) {
          header.antennaDelta.h = Number.parseFloat(line.substring(0, 14).trim());
          header.antennaDelta.e = Number.parseFloat(line.substring(14, 28).trim());
          header.antennaDelta.n = Number.parseFloat(line.substring(28, 42).trim());
        } else if (line.includes('SYS / # / OBS TYPES')) {
          const system = line.charAt(0);
          const numTypes = Number.parseInt(line.substring(4, 6).trim(), 10);
          const observationTypes: ObservationTypes = {};
          let index = 7;
          const currentLine = lines.shift()
          if (!currentLine) continue;
          for (let i = 0; i < numTypes; i++) {
            if (index > 58) {
              index = 7;
              line = currentLine;
            }
            const obsType = line.substring(index, index + 3).trim();
            observationTypes[obsType as keyof ObservationTypes] = i + 1;
            index += 4;
          }
          header.observationTypes[system] = observationTypes;
        } else if (line.includes('INTERVAL')) {
          header.interval = Number.parseFloat(line.substring(0, 10).trim());
        } else if (line.includes('TIME OF FIRST OBS')) {
          const year = Number.parseInt(line.substring(2, 6).trim(), 10);
          const month = Number.parseInt(line.substring(10, 12).trim(), 10);
          const day = Number.parseInt(line.substring(16, 18).trim(), 10);
          const hour = Number.parseInt(line.substring(22, 24).trim(), 10);
          const minute = Number.parseInt(line.substring(28, 30).trim(), 10);
          const second = Number(line.substring(33, 43).trim());
          const date = dayjs.utc().set('year', year).set('month', month - 1).set('date', day).set('hour', hour).set('minute', minute).set('second', second);
          const gpsEpoch = dayjs.utc().set('year', 1980).set('month', 0).set('date', 6).set('hour', 0).set('minute', 0).set('second', 0);
          const tocInSeconds = date.diff(gpsEpoch, 'second');
          header.tocOfFirstObs = tocInSeconds;

        } else if (line.includes('SYS / PHASE SHIFT')) {
          const system = line.charAt(0);
          const observationType = line.substring(2, 5).trim();
          const shift = Number.parseFloat(line.substring(5, 15).trim());
          if (!header.phaseShifts[system]) {
            header.phaseShifts[system] = {};
          }
          header.phaseShifts[system][observationType] = shift;
        } else if (line.includes('SIGNAL STRENGTH UNIT')) {
          header.signalStrengthUnit = line.substring(0, 4).trim();
        } else if (line.includes('GLONASS SLOT / FRQ #')) {
          const parts = line.split(/\s+/);
          for (let i = 1; i < parts.length; i += 2) {
            const part1 = parts[i];
            const part2 = parts[i + 1];
            if (part1 && part2) {
              header.glonassSlotFrequencies[part1] = Number.parseInt(part2, 10);
            }
          }
        }
      }
      continue;
    }

    if (line.startsWith('>')) {
      currentEpoch = parseToc(line);
      if (!body[currentEpoch]) {
        body[currentEpoch] = {};
      }
      continue;
    }

    const prn = line.substring(0, 3).trim();
    const observation = {
      pseudorange: Number.parseFloat(line.substring(3, 20).trim()),
      carrierPhase: Number.parseFloat(line.substring(20, 37).trim()),
      signalStrength: Number.parseFloat(line.substring(37, 54).trim()),
    };
    const currentEpochData = body[currentEpoch];
    if (!currentEpochData) {
      body[currentEpoch] = { [prn]: observation };
    } else if (!currentEpochData[prn]) {
      currentEpochData[prn] = observation;
    }
  }

  return { header, body };
}


export function parseRnxMeteo(input: string): RinexMeteo {
  return {
    test: [Number(input)],
  }
}

export function checkRnxType(input: string): "navigation" | "observation" | "meteo" | null {
  const lines = input.split('\n')
  for (const line of lines) {
    if (line.includes("RINEX VERSION / TYPE")) {
      if (line.includes("NAVIGATION") || line.includes("NAV")) return "navigation"
      if (line.includes("OBSERVATION") || line.includes("OBS")) return "observation"
      if (line.includes("METEO")) return "meteo"
    }
  }
  return null
}
