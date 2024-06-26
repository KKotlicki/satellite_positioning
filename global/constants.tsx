import { blue, deepPurple, green, orange, pink, red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";
import { Roboto } from "next/font/google";


export const project = "GNSS Planning"
export const pages = ["Settings", "Selection", "Charts", "Sky Plot", "World View", "Receiver"] as const
export const theme = createTheme({
  palette: {
    primary: {
      main: deepPurple[300]
    },
    mode: "dark"
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html, body, #__next {
					height: 100%;
        }
        .leaflet-tooltip {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: white !important;
          font-size: 2vh !important;
        }
        .leaflet-tooltip::before {
          display: none !important;
        }
      `,
    },
  },
})

export const roboto = Roboto({
  weight: "400",
  subsets: ["latin"]
})

export const drawerWidth = 240

export const SPEED_OF_LIGHT = 299792458
export const WGS84_EARTH_RADIUS_MAJOR = 637137
export const WGS84_EARTH_RADIUS_MINOR = 6356752.3142
export const WGS84_EARTH_GRAVITATIONAL_PARAMETER = 3.986005e14
export const WGS84_EARTH_ROTATION_RATE = 7.2921151467e-5

export const mapLayerLink = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
export const mapLayerAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export const PRN_GNSS: [
  ["G", number, number],
  ["R", number, number],
  ["J", number, number],
  ["E", number, number],
  ["C", number, number]
] = [
    ["G", 1, 37],
    ["R", 38, 64],
    ["J", 111, 118],
    ["E", 201, 263],
    ["C", 264, 310],
  ];

export const satelliteProviders = [
  { name: 'GPS', color: green, prefix: 'G' },
  { name: 'GLONASS', color: red, prefix: 'R' },
  { name: 'Galileo', color: blue, prefix: 'E' },
  { name: 'Beidou', color: orange, prefix: 'C' },
  { name: 'QZSS', color: pink, prefix: 'J' },
];
