import type { Almanac, RinexMeteo, RinexNavigation, RinexObservation } from "@/global/types"

export function parseAlmFile(input: string): Almanac {
  const data: string = input

  let res = [] as number[][]
  let shiftToNext = 0
  let previousColumnsAmount = 0

  for (const line of data.split("\n")) {
    const numbers = line.replace(/\-/g, " -").trim().split(/\s+/)

    if (numbers.length <= 1) {
      shiftToNext += previousColumnsAmount
      continue
    }

    previousColumnsAmount = numbers.length + 1

    for (let i = 0; i < numbers.length; i++) {
      const n = numbers[i]
      if (n === undefined) throw new Error("Undefined number")
      const satellite = res[i + shiftToNext]
      if (!satellite) res[i + shiftToNext] = []
      if (Number.isNaN(n)) continue
      res[i + shiftToNext]?.push(+n)
    }
  }

  res = res.filter((x) => x)
  const dic = new Map<number, number[]>()

  for (const nums of res) {
    const key = nums[0]
    if (key === undefined) throw new Error("Undefined key")
    dic.set(key, nums.splice(1))
  }

  return dic
}

export function parseRnxNavigation(input: string): RinexNavigation {
  type Toc = { [K in keyof RinexNavigation[string][string]]: number };
  const s2n = (s: string, p: number): number => {
    const a = s.substring(p * 19 + 4, 4 + (p + 1) * 19).trim();
    return a ? Number.parseFloat(a) : Number.NaN;
  };

  const s2e = (s: string, p: number, n: number): number[] => [
    Number.parseInt(s.substring(p, p + 4), 10),
    Number.parseInt(s.substring(p + 5, p + 7), 10),
    Number.parseInt(s.substring(p + 8, p + 10), 10),
    Number.parseInt(s.substring(p + 11, p + 13), 10),
    Number.parseInt(s.substring(p + 14, p + 16), 10),
    Number.parseFloat(s.substring(p + 17, n).trim())
  ];

  const initializeNavEntry = (): Toc => {
    const keys: (keyof RinexNavigation[string][string])[]
      = [
        'af0', 'af1', 'af2', 'IODE', 'Crs', 'delta_n', 'M0',
        'Cuc', 'e', 'Cus', 'sqrt_a', 'toe', 'Cic', 'Omega0', 'Cis',
        'i0', 'Crc', 'omega', 'OmegaDot', 'IDOT', 'L2', 'GPSWeek',
        'L2P', 'accuracy', 'health', 'TGD', 'IODC', 'Tom'
      ]
    return keys.reduce((acc, key) => {
      acc[key] = Number.NaN;
      return acc;
    }, {} as Toc);
  };

  const lines = input.split('\n');
  const nav: RinexNavigation = {};
  let headerEnded = false;
  let currentPRN: string | null = null;
  let toc: string | null = null;
  let m = 1;

  for (const s of lines) {
    if (!headerEnded) {
      if (s.includes('END OF HEADER')) {
        headerEnded = true;
      }
      continue;
    }

    if (!s) continue;

    const line = s.replace(/D/g, 'E');

    if (m === 1) {
      currentPRN = line.substring(0, 3).trim();
      const epoch = s2e(line, 4, 23);

      if (!currentPRN || epoch.some(e => Number.isNaN(e))) {
        continue;
      }

      const epoch5 = epoch[5];
      if (epoch5 === undefined) continue;

      toc = `${epoch[0]}-${String(epoch[1]).padStart(2, '0')}-${String(epoch[2]).padStart(2, '0')}T${String(epoch[3]).padStart(2, '0')}:${String(epoch[4]).padStart(2, '0')}:${String(Math.floor(epoch5)).padStart(2, '0')}`;

      const currentSat = nav[currentPRN];
      if (currentSat === undefined) continue;

      currentSat[toc] = {
        ...initializeNavEntry(),
        af0: s2n(line, 1),
        af1: s2n(line, 2),
        af2: s2n(line, 3),
      }
    } else if (currentPRN && toc) {
      const keys = [
        ['IODE', 'Crs', 'delta_n', 'M0'],
        ['Cuc', 'e', 'Cus', 'sqrt_a'],
        ['toe', 'Cic', 'Omega0', 'Cis'],
        ['i0', 'Crc', 'omega', 'OmegaDot'],
        ['IDOT', 'L2', 'GPSWeek', 'L2P'],
        ['accuracy', 'health', 'TGD', 'IODC'],
        ['Tom']
      ] as const;

      const currentKeys = keys[m - 2];
      if (!currentKeys) continue;
      currentKeys.forEach((key, index) => {
        if (currentPRN === null || toc === null) return;
        const currentSat = nav[currentPRN];
        if (currentSat === undefined) return;
        const currentSatTime = currentSat[toc];
        if (currentSatTime === undefined) return;
        currentSatTime[key] = s2n(line, index);
      });
    }

    m = (m % 8) + 1;
  }

  return nav;
}

export function parseRnxObservation(input: string): RinexObservation {
  return {
    test: [1, 2, 3],
  }
}

export function parseRnxMeteo(input: string): RinexMeteo {
  return {
    test: [1, 2, 3],
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