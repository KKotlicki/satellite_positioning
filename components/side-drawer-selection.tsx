import { theme } from "@/constants/constants";
import useStore from "@/store/store";
import { Card, CardContent, CardHeader, Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";
import { blue, green, orange, pink, red } from "@mui/material/colors";
import { useZustand } from "use-zustand";

const satelliteProviders = [
  { name: 'GPS', color: green },
  { name: 'GLONASS', color: red },
  { name: 'Galileo', color: blue },
  { name: 'Beidou', color: orange },
  { name: 'QZSS', color: pink },
];


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
    const sortedArray = Array.from(selectedSatellitesSet).sort((a, b) => a - b)
    const sortedSet = new Set(sortedArray)
    changeSelectedSatellites(sortedSet)
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
          {satelliteProviders.map((provider, index) => (
            <FormControlLabel
              key={provider.name}
              control={
                <Checkbox
                  sx={{
                    color: provider.color[800],
                    "&.Mui-checked": { color: provider.color[600] }
                  }}
                  onChange={(e) => setSatelliteSelection(index, e.target.checked)}
                />
              }
              label={provider.name}
            />
          ))}
        </FormGroup>
        <Typography variant='body1' color='textSecondary'>
          {selectedSatellites.size} selected
        </Typography>
      </CardContent>
    </Card>
  );
}
