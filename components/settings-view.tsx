import useStore from "@/store/store";
import Box from "@mui/material/Box";
import { useZustand } from "use-zustand";


const SettingsView = () => {
  const latitude = useZustand(useStore,(state) => state.latitude)
  const longitude = useZustand(useStore,(state) => state.longitude)
  const height = useZustand(useStore,(state) => state.height)
  const elevationCutoff = useZustand(useStore,(state) => state.elevationCutoff)
  const date = useZustand(useStore,(state) => state.date)
  const almanacName = useZustand(useStore,(state) => state.almanacName)

  return (
    <Box
      component='ul'
      sx={{
        m: 0,
        p: 0,
        pl: 1
      }}
    >
      <li>Latitude: {latitude}</li>
      <li>Longitude: {longitude}</li>
      <li>Height: {height}</li>
      <li>Elevation cutoff: {elevationCutoff}</li>
      <li>Date: {date.format("MM/DD/YYYY")}</li>
      <li>Almanac: {almanacName}</li>
    </Box>
  )
}

export default SettingsView
