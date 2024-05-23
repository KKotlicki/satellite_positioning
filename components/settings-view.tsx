import { theme } from "@/global/constants";
import { useAlmanacFile, useElevationCutoff, useHeight, useLatitude, useLongitude, useSelectedTocs } from "@/stores/almanac-store";
import { useRinexNavigationFile, useRinexObservationPeriod } from "@/stores/rinex-store";
import { Card, CardContent, CardHeader, Paper } from "@mui/material";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
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

const RinexPaper = styled(Paper, { shouldForwardProp: (prop) => prop !== 'color' })(({ theme, color }) => ({
  flex: '1 0 auto',
  margin: theme.spacing(1),
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: 'center',
  maxWidth: '100%',
  backgroundColor: color,
  fontSize: '0.6rem',
  whiteSpace: 'pre-line',
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
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
  const almanacFile = useAlmanacFile();
  const rinexNavigationFile = useRinexNavigationFile();
  const rinexObservationPeriod = useRinexObservationPeriod();
  const selectedTocs = useSelectedTocs();

  const startSelectedToc = selectedTocs[0];
  const endSelectedToc = selectedTocs[selectedTocs.length - 1];
  if (startSelectedToc === undefined || endSelectedToc === undefined) return (<></>);

  const startDateTime = dayjs.unix(startSelectedToc + 315964800).utc().format("DD/MM/YYYY HH:mm:ss");
  const endDateTime = dayjs.unix(endSelectedToc + 315964800).utc().format("DD/MM/YYYY HH:mm:ss");

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
      {rinexNavigationFile.content !== undefined ? (
        <CardContent>
          <Box
            component='ul'
            sx={{
              m: 0,
              p: 0,
              pl: 1
            }}
          >
            <li>Observation start: {rinexObservationPeriod[0]?.utc().format("DD/MM/YYYY HH:mm:ss")}</li>
            <li>Observation end: {rinexObservationPeriod[1]?.utc().format("DD/MM/YYYY HH:mm:ss")}</li>
          </Box>
          <RinexPaper color={rinexNavigationFile.content ? 'green' : 'red'}>
            {formatAlmanacName(rinexNavigationFile.fileName?.slice(0, -4) || null) || `No ${rinexNavigationFile.name} Uploaded`}
          </RinexPaper>
          <UploadZone />
        </CardContent>
      )
        : almanacFile.content !== undefined ? (
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
              <li>Observation start: {startDateTime}</li>
              <li>Observation end: {endDateTime}</li>
            </Box>
            <AlmanacPaper color={almanacFile.content ? 'green' : 'red'}>
              {formatAlmanacName(almanacFile.fileName?.slice(0, -4) || null) || `No ${almanacFile.name} Uploaded`}
            </AlmanacPaper>
            <RinexPaper color={rinexNavigationFile.content ? 'green' : 'red'}>
              {formatAlmanacName(rinexNavigationFile.fileName?.slice(0, -4) || null) || `No ${rinexNavigationFile.name} Uploaded`}
            </RinexPaper>
            <UploadZone />
          </CardContent>
        )
          : (
            <CardContent>
              <AlmanacPaper color='red'>
                {"No Files Uploaded"}
              </AlmanacPaper>
            </CardContent>
          )
      }
    </Card>
  );
}
