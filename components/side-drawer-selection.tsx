import { satelliteProviders, theme } from "@/global/constants";
import type { Almanac } from "@/global/types";
import { useNavigationActions, useNavigationFile, useSelectedSatellites, useSelectedTocs } from "@/stores/navigation-store";
import { Card, CardContent, CardHeader, Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";
import { useEffect, useState } from "react";


export default function SideDrawerSelection(): JSX.Element {
  const navigationFile = useNavigationFile();
  const selectedSatellites = useSelectedSatellites();
  const selectedTocs = useSelectedTocs();
  const { changeSelectedSatellites } = useNavigationActions();

  const [providerChecked, setProviderChecked] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const newProviderChecked = satelliteProviders.reduce((acc, curr) => {
      const providerSatellites = selectedSatellites[curr.prefix] || {};
      const isChecked = Object.values(providerSatellites).some(sat => sat.isSelected);
      acc[curr.prefix] = isChecked;
      return acc;
    }, {} as { [key: string]: boolean });
    setProviderChecked(newProviderChecked);
  }, [selectedSatellites]);

  const setSatelliteSelection = (provider: string, turnOn: boolean) => {
    const newSelectedSatellites = { ...selectedSatellites };

    const checkHealthStatus = (satellite: Almanac[string]): { health: number } => {
      const tocs = Object.entries(satellite).map(([toc, data]) => ({
        toc: Number(toc),
        health: data.health,
      }));

      if (tocs.length === 0) return { health: 1 };

      const firstToc = selectedTocs[0];
      const lastToc = selectedTocs[selectedTocs.length - 1];
      if (firstToc === undefined || lastToc === undefined) return { health: 1 };

      const allHealthyInRange = selectedTocs.every(toc => {
        const health = satellite[toc]?.health;
        return health === 0;
      });

      if (allHealthyInRange) return { health: 0 };

      const closestToStart = tocs.reduce((prev, curr) => {
        return Math.abs(curr.toc - firstToc) < Math.abs(prev.toc - firstToc) ? curr : prev;
      });

      const closestToEnd = tocs.reduce((prev, curr) => {
        return Math.abs(curr.toc - lastToc) < Math.abs(prev.toc - lastToc) ? curr : prev;
      });

      return closestToStart.health === 0 || closestToEnd.health === 0 ? { health: 0 } : { health: 1 };
    };

    if (navigationFile === null) return;
    const allSatellites = new Set([
      ...Object.keys(navigationFile.content || {})
    ]);

    for (const prn of Array.from(allSatellites)) {
      if (prn.charAt(0) === provider) {
        const satelliteData = navigationFile.content?.[prn];
        const healthStatus = satelliteData ? checkHealthStatus(satelliteData) : { health: 1 };

        if (!newSelectedSatellites[provider]) {
          newSelectedSatellites[provider] = {};
        }

        if (turnOn) {
          newSelectedSatellites[provider][prn] = {
            isSelected: true,
            health: healthStatus.health,
          };
        } else {
          delete newSelectedSatellites[provider][prn];
        }
      }
    }

    changeSelectedSatellites(newSelectedSatellites);
  };

  const countSelectedSatellites = Object.values(selectedSatellites).reduce((acc, providerSatellites) => {
    return acc + Object.values(providerSatellites).filter(sat => sat.isSelected).length;
  }, 0);

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
          {satelliteProviders.map((provider) => (
            <FormControlLabel
              key={provider.name}
              control={
                <Checkbox
                  sx={{
                    color: provider.color[800],
                    "&.Mui-checked": { color: provider.color[600] }
                  }}
                  checked={providerChecked[provider.prefix] || false}
                  onChange={(e) => setSatelliteSelection(provider.prefix, e.target.checked)}
                />
              }
              label={provider.name}
            />
          ))}
        </FormGroup>
        <Typography variant='body1' color='textSecondary'>
          {countSelectedSatellites} selected
        </Typography>
      </CardContent>
    </Card>
  );
}
