import type { SelectedSatellites } from '@/global/types';
import { useAlmanacActions, useElevationCutoff, useSelectedSatellites, useSelectedTocs, useSky, useTime } from '@/stores/almanac-store';
import { useTheme } from "@mui/material/styles";
import type { Layout } from 'plotly.js';
import Plot from "react-plotly.js";
import generateVisibilityData from './graph/visibility-generate';


export default function VisibilityGraph() {
  const theme = useTheme();
  const sky = useSky();
  const time = useTime();
  const selectedSatellites = useSelectedSatellites();
  const elevationCutoff = useElevationCutoff();
  const { changeSelectedSatellites } = useAlmanacActions();
  const selectedTocs = useSelectedTocs();

  const timeLabels = selectedTocs.map(toc => new Date((toc + 315964800) * 1000).toISOString().substr(11, 5));

  const selectedSatellitesArray = Object.entries(selectedSatellites).flatMap(([_, sats]) =>
    Object.keys(sats || {}).filter(prn => sats?.[prn]?.isSelected)
  );

  const layout: Partial<Layout> = {
    autosize: true,
    margin: {
      pad: 0,
    },
    paper_bgcolor: theme.palette.background.default,
    plot_bgcolor: theme.palette.background.default,
    xaxis: {
      title: 'Time',
      showline: true,
      linecolor: theme.palette.text.primary,
      tickfont: {
        color: theme.palette.text.primary,
      },
      range: [0, timeLabels.length - 1],
      fixedrange: true,
      tickvals: Array.from({ length: timeLabels.length }, (_, i) => i).filter((_, index) => index % 12 === 0),
      ticktext: timeLabels.filter((_, index) => index % 12 === 0),
    },
    yaxis: {
      showline: true,
      gridcolor: theme.palette.divider,
      linecolor: theme.palette.text.primary,
      tickfont: {
        color: theme.palette.text.primary,
      },
      title: 'Satellite ID',
      range: [-1, selectedSatellitesArray.length],
      fixedrange: true,
      tickvals: Array.from({ length: selectedSatellitesArray.length }, (_, i) => i),
      ticktext: selectedSatellitesArray,
    },
    legend: {
      tracegroupgap: 0,
    },
  };

  const handleLegendClick = (event: Readonly<Plotly.LegendClickEvent>) => {
    const clickedSatelliteName = event.data[event.curveNumber]?.name;
    if (!clickedSatelliteName) return false;
    const updatedSelectedSatellites = Object.entries(selectedSatellites).reduce((acc, [provider, sats]) => {
      const newSats = Object.keys(sats || {}).reduce((satAcc, prn) => {
        if (prn !== clickedSatelliteName) {
          const satPrn = sats[prn];
          if (satPrn === undefined) return satAcc;
          satAcc[prn] = satPrn;
        }
        return satAcc;
      }, {} as SelectedSatellites[string]);
      if (Object.keys(newSats).length > 0) {
        acc[provider] = newSats;
      }
      return acc;
    }, {} as SelectedSatellites);
    changeSelectedSatellites(updatedSelectedSatellites);
    return false;
  };

  return (
    <Plot
      data={generateVisibilityData(sky, elevationCutoff, time, selectedSatellites, selectedTocs)}
      layout={layout}
      config={{
        displayModeBar: false,
      }}
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'stretch',
      }}
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      onLegendClick={(e: Readonly<any>) => handleLegendClick(e)}
    />
  );
}
