import { satelliteProviders, theme, PRN_GNSS } from "@/global/constants";
import { useAlmanacActions, useAlmanacFile, useSelectedSatellites } from "@/stores/almanac-store";
import { Card, CardContent, CardHeader, Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";


export default function SideDrawerSelection(): JSX.Element {
  const almanacFile = useAlmanacFile()
  const selectedSatellites = useSelectedSatellites()
  const { changeSelectedSatellites } = useAlmanacActions()

  const setSatelliteSelection = (provider: number, turnOn: boolean) => {
    const satelliteIdRange: [number, number] = (() => {
      switch (provider) {
        case 0:
          return PRN_GNSS[0].slice(1) as [number, number]
        case 1:
          return PRN_GNSS[1].slice(1) as [number, number]
        case 2:
          return PRN_GNSS[3].slice(1) as [number, number]
        case 3:
          return PRN_GNSS[4].slice(1) as [number, number]
        case 4:
          return PRN_GNSS[2].slice(1) as [number, number]
        default:
          throw new Error("Invalid provider")
      }
    })()
    const selectedSatellitesSet = new Set(selectedSatellites)
    for (let i = satelliteIdRange[0]; i <= satelliteIdRange[1]; i++) {
      if (almanacFile.content === null) throw new Error("Almanac content is null")
      if (almanacFile.content.get(i) === undefined) continue
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
