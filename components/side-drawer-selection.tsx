import { theme } from "@/constants/constants";
import useStore from "@/store/store";
import { Card, CardContent, CardHeader, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { blue, green, orange, pink, red } from "@mui/material/colors";
import { useZustand } from "use-zustand";


export default function SideDrawerSelection(): JSX.Element {
  const almanac = useZustand(useStore, (state) => state.almanac)
  const selectedSatellites = useZustand(useStore, (state) => state.selectedSatellites)
  const changeSelectedSatellites = useZustand(useStore, (state) => state.changeSelectedSatellites);
  const setSatelliteSelection = (provider: number, turnOn: boolean) => {
    const satelliteIdRange: [number, number] = (() => {
      switch (provider) {
        case 0:
          return [1, 37]
        case 1:
          return [38, 64]
        case 2:
          return [201, 263]
        case 3:
          return [264, 283]
        case 4:
          return [111, 118]
        default:
          throw new Error("Invalid provider")
      }
    })()
    const selectedSatellitesSet = new Set(selectedSatellites)
    for (let i = satelliteIdRange[0]; i <= satelliteIdRange[1]; i++) {
      if (almanac.get(i) === undefined) continue
      if (turnOn) {
        selectedSatellitesSet.add(i)
      } else {
        selectedSatellitesSet.delete(i)
      }
    }
    changeSelectedSatellites(Array.from(selectedSatellitesSet))
  }

  return (
    <Card
      sx={{
        width: "full-width",
        margin: "1rem"
      }}
      variant='outlined'
    >
      <CardHeader
        title='Satellite Selection'
        style={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.divider
        }}
      />
      <CardContent>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                sx={{
                  color: green[800],
                  "&.Mui-checked": { color: green[600] }
                }}
                onChange={(e) => setSatelliteSelection(0, e.target.checked)}
              />
            }
            label='GPS'
          />
          <FormControlLabel
            control={
              <Checkbox
                sx={{
                  color: red[800],
                  "&.Mui-checked": { color: red[600] }
                }}
                onChange={(e) => setSatelliteSelection(1, e.target.checked)}
              />
            }
            label='GLONASS'
          />
          <FormControlLabel
            control={
              <Checkbox
                sx={{
                  color: blue[800],
                  "&.Mui-checked": { color: blue[600] }
                }}
                onChange={(e) => setSatelliteSelection(2, e.target.checked)}
              />
            }
            label='Galileo'
          />
          <FormControlLabel
            control={
              <Checkbox
                sx={{
                  color: orange[800],
                  "&.Mui-checked": { color: orange[600] }
                }}
                onChange={(e) => setSatelliteSelection(3, e.target.checked)}
              />
            }
            label='Beidou'
          />
          <FormControlLabel
            control={
              <Checkbox
                sx={{
                  color: pink[800],
                  "&.Mui-checked": { color: pink[600] }
                }}
                onChange={(e) => setSatelliteSelection(4, e.target.checked)}
              />
            }
            label='QZSS'
          />
        </FormGroup>
      </CardContent>
    </Card>
  );
}
