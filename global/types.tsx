export type SatellitePath = Map<number, [number, number, number][]>
export type SatellitePathGeocentric = Map<number, [number, number][]>
export type SkyPath = Map<number, [number | undefined, number][]>
export type DOPList = Array<number[]>
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
export type Almanac = Map<number, number[]>

export type RinexNavigation = {
  [PRN: string]: {
    [toc: string]: {
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
}}}

export type RinexObservation  = {
  [key: string]: number[]
}

export type RinexMeteo = {
  [key: string]: number[]
}

export type AstronomyFile<T extends Almanac | RinexNavigation | RinexObservation | RinexMeteo> = {
  name: string
  extensions: string[]
  fileName: string | null
  content: T | null
}
