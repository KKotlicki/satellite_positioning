export type SelectedSatellites = {
  [provider: string]: {
    [PRN: string]: {
      isSelected: boolean,
      health: number,
    }
  }
}

export type SatellitePath = {
  [PRN: string]: {
    [toc: number]: {
      x: number,
      y: number,
      z: number
    }
  }
}

export type SatellitePathGeocentric = {
  [PRN: string]: {
    [toc: number]: {
      latitude: number,
      longitude: number,
    }
  }
}

export type SkyPath = {
  [PRN: string]: {
    [toc: number]: {
      elevation: number | undefined,
      azimuth: number,
    }
  }
}

export type DOPList = {
  [toc: number]: {
    TDOP: number,
    PDOP: number,
    VDOP: number,
    HDOP: number,
  }
}


export type PlotXYObjectData = {
  x: string[] | number[]
  y: number[]
  mode: 'lines' | 'markers' | 'text+markers' | 'lines+text'
  name: string
  showlegend: boolean
  legendgroup?: string
  hovertemplate?: string
  hoverinfo?: "none"
  line?: {
    color: string
    width: number
  }
  marker?: {
    color: string
    size: number
  }
  text?: string[]
  textposition?: "top center"
  textfont?: {
    color: string,
    family: "Roboto Bold, Roboto, sans-serif",
    size: number
  },
}

export type Almanac = {
  [PRN: string]: {
    [toc: number]: {
      health: number,
      e: number,
      sqrt_a: number,
      Omega0: number,
      omega: number,
      M0: number,
      toe: number,
      i0: number,
      OmegaDot: number,
      af0: number,
      af1: number,
      GPSWeek: number,
    }
  }
}

export type RinexNavigation = {
  [PRN: string]: {
    [toc: number]: {
      af0: number,
      af1: number,
      af2: number,
      IODE: number,
      Crs: number,
      delta_n: number,
      M0: number,
      Cuc: number,
      e: number,
      Cus: number,
      sqrt_a: number,
      toe: number,
      Cic: number,
      Omega0: number,
      Cis: number,
      i0: number,
      Crc: number,
      omega: number,
      OmegaDot: number,
      IDOT: number,
      L2: number,
      GPSWeek: number,
      L2P: number,
      accuracy: number,
      health: number,
      TGD: number,
      IODC: number,
      Tom: number,
    }
  }
}

export type ObservationTypes = {
  C1C?: number;
  L1C?: number;
  S1C?: number;
  C2W?: number;
  L2W?: number;
  S2W?: number;
  C2X?: number;
  L2X?: number;
  S2X?: number;
  C5X?: number;
  L5X?: number;
  S5X?: number;
  C1P?: number;
  L1P?: number;
  S1P?: number;
  C2C?: number;
  L2C?: number;
  S2C?: number;
  C3X?: number;
  L3X?: number;
  S3X?: number;
  C1X?: number;
  L1X?: number;
  S1X?: number;
  C1Z?: number;
  L1Z?: number;
  S1Z?: number;
  C2I?: number;
  L2I?: number;
  S2I?: number;
  C7I?: number;
  L7I?: number;
  S7I?: number;
  C6I?: number;
  L6I?: number;
  S6I?: number;
}

export type RinexObservationHeader = {
  approxPositionXYZ: {
    x: number;
    y: number;
    z: number;
  }
  antennaDelta: {
    h: number;
    e: number;
    n: number;
  }
  observationTypes: { [system: string]: ObservationTypes; }
  interval: number;
  tocOfFirstObs: number;
  phaseShifts: {
    [system: string]: {
      [observationType: string]: number;
    };
  }
  signalStrengthUnit: string;
  glonassSlotFrequencies: { [prn: string]: number }
}

export type RinexObservationBody = {
  [toc: number]: {
    [prn: string]: {
      pseudorange: number,
      carrierPhase: number,
      signalStrength: number,
    }
  }
};

export type RinexObservation = {
  header: RinexObservationHeader;
  body: RinexObservationBody;
}

export type RinexMeteo = { [key: string]: number[] }

export type AstronomyData = Almanac | RinexNavigation | RinexObservation | RinexMeteo

export type AstronomyFile<T extends AstronomyData> = {
  fileName: string,
  content: T,
}
