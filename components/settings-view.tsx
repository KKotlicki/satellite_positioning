import { theme } from "@/global/constants";
import { useAlmanacFile, useDate, useElevationCutoff, useHeight, useLatitude, useLongitude } from "@/stores/almanac-store";
import { useRinexFile } from "@/stores/rinex-store";
import { Card, CardContent, CardHeader, Paper } from "@mui/material";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import UploadZone from "./settings/upload_zone";


const AlmanacPaper = styled(Paper, { shouldForwardProp: (prop) => prop !== 'color' })(({ theme, color }) => ({
  flex: '1 0 auto',
  margin: theme.spacing(1),
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: 'center',
  maxWidth: '100%',
  backgroundColor: color,
}));

const formatAlmanacName = (name: string | null): string | null => {
  let formattedName: string | null = name;
  if (formattedName?.endsWith(".alm")) {
    formattedName = formattedName.slice(0, -4);
  }
  if (formattedName?.startsWith("Almanac") && formattedName.length > 7) {
    formattedName = formattedName.slice(7);
  }
  return formattedName || null;
};

export default function SettingsView(): JSX.Element {
  const latitude = useLatitude();
  const longitude = useLongitude();
  const height = useHeight();
  const elevationCutoff = useElevationCutoff();
  const date = useDate();
  const almanacFile = useAlmanacFile();
  const rinexFile = useRinexFile()

  function parseLatitude(latitude: number): string {
    const direction = latitude < 0 ? "S" : "N";
    const absolute = Math.abs(latitude);
    const degrees = Math.floor(absolute);
    const minutes = (absolute - degrees) * 60;
    return `${degrees}° ${minutes.toFixed(2)}' ${direction}`;
  }

  function parseLongitude(longitude: number): string {
    const direction = longitude < 0 ? "W" : "E";
    const absolute = Math.abs(longitude);
    const degrees = Math.floor(absolute);
    const minutes = (absolute - degrees) * 60;
    return `${degrees}° ${minutes.toFixed(2)}' ${direction}`;
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
        title='My Settings'
        style={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.divider
        }}
      />
      {almanacFile.content === null ? (
        <CardContent>
          <AlmanacPaper color='red'>
            {"No Files Uploaded"}
          </AlmanacPaper>
        </CardContent>
      )
        : (
          <CardContent>
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
              <li>Date: {date.format("DD/MM/YYYY")}</li>
            </Box>
            <AlmanacPaper color={almanacFile.content ? 'green' : 'red'}>
              {formatAlmanacName(almanacFile.fileName) || `No ${almanacFile.name} Uploaded`}
            </AlmanacPaper>
            <AlmanacPaper color={rinexFile.content ? 'green' : 'red'}>
              {formatAlmanacName(rinexFile.fileName) || `No ${rinexFile.name} Uploaded`}
            </AlmanacPaper>
            <UploadZone />
          </CardContent>
        )
      }
    </Card>
  );
}
