import useStore from "@/store/store";
import Box from "@mui/material/Box";


const SettingsView = () => {
  const latitude = useStore((state) => state.latitude)
  const longitude = useStore((state) => state.longitude)
  const height = useStore((state) => state.height)
  const elevationCutoff = useStore((state) => state.elevationCutoff)
  const date = useStore((state) => state.date)
  const almanacName = useStore((state) => state.almanacName)

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
