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
