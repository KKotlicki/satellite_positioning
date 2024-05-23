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

export type RinexObservation = { [key: string]: number[] }
export type RinexMeteo = { [key: string]: number[] }

export type AstronomyData = Almanac | RinexNavigation | RinexObservation | RinexMeteo

export type AstronomyFile<T extends AstronomyData> = {
  name: string
  extensions: string[]
  fileName?: string
  content?: T
}
