import SatelliteSelection from "@/components/satellite-selection";
import { useNavigationFile } from "@/stores/navigation-store";
import { Box, Card, CardContent, CardHeader, Tab, Tabs } from "@mui/material";
import {
  blue,
  green,
  orange,
  pink,
  red
} from "@mui/material/colors";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const VisibilityGraph = dynamic(() => import("../components/visibility-graph"), {
  ssr: false
})


export default function Selection() {
  const containerRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const navigationFile = useNavigationFile();

  const handleChangeTab = (_event: React.ChangeEvent<unknown>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const providers = ['G', 'R', 'E', 'C', 'J'];

  return (
    <Box
      ref={containerRef}
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="100%"
      height="100%"
      overflow="hidden"
      style={{ fontFamily: 'monospace' }}
    >
      <Box
        display="flex"
        width="100%"
        height="100%"
        overflow="hidden"
      >
        <Card
          sx={{
            flex: '1 1 50%',
            margin: 1,
            overflow: 'auto',
          }}
          variant="outlined"
        >
          <CardHeader
            title={
              <Tabs value={selectedTab} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto"
                sx={{
                  '.MuiTabs-flexContainer': {
                    justifyContent: 'center',
                  },
                  width: '100%',
                }}
              >
                <Tab label={<b>GPS</b>} style={{ color: green[800] }} />
                <Tab label={<b>GLONASS</b>} style={{ color: red[800] }} />
                <Tab label={<b>Galileo</b>} style={{ color: blue[800] }} />
                <Tab label={<b>Beidou</b>} style={{ color: orange[800] }} />
                <Tab label={<b>QZSS</b>} style={{ color: pink[800] }} />
              </Tabs>
            }
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: 'divider',
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
          />

          <CardContent>
            <SatelliteSelection provider={providers[selectedTab] || "G"} />
          </CardContent>
        </Card>
        {navigationFile !== null ? (
          <Box
            sx={{
              flex: '1 1 50%',
              margin: 1,
              overflow: 'auto',
            }}
          >
            <VisibilityGraph />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
