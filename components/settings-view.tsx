import useStore from "@/store/store";
import Box from "@mui/material/Box";
import { useZustand } from "use-zustand";


const SettingsView = () => {
  const latitude = useZustand(useStore, (state) => state.latitude)
  const longitude = useZustand(useStore, (state) => state.longitude)
  const height = useZustand(useStore, (state) => state.height)
  const elevationCutoff = useZustand(useStore, (state) => state.elevationCutoff)
  const date = useZustand(useStore, (state) => state.date)
  const almanacName = useZustand(useStore, (state) => state.almanacName)
  function parseLatitude(latitude: number) {
    const direction = latitude < 0 ? "S" : "N"
    const absolute = Math.abs(latitude)
    const degrees = Math.floor(absolute)
    const minutes = (absolute - degrees) * 60
    return `${degrees}° ${minutes.toFixed(2)}' ${direction}`
  }

  function parseLongitude(longitude: number) {
    const direction = longitude < 0 ? "W" : "E"
    const absolute = Math.abs(longitude)
    const degrees = Math.floor(absolute)
    const minutes = (absolute - degrees) * 60
    return `${degrees}° ${minutes.toFixed(2)}' ${direction}`
  }

  return (
    <Box
      component='ul'
      sx={{
        m: 0,
        p: 0,
        pl: 1
      }}
    >
      <li>{parseLatitude(latitude)}</li>
      <li>{parseLongitude(longitude)}</li>

      <li>Height: {height} m</li>
      <li>Elevation cutoff: {elevationCutoff}°</li>
      <li>Date: {date.format("MM/DD/YYYY")}</li>
      <li>Almanac:{`\n${almanacName}`}</li>
    </Box>
  )
}

export default SettingsView
