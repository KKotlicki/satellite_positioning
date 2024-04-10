import type { PlotXYObjectData, SkyPath } from '@/constants/types';
import { satelliteIDToName, satelliteNameToID } from '@/services/astronomy';
import { generateColorPalette, generateSpecificTimeLine, generateTimeLabels } from '@/services/graphUtilites';
import useStore from "@/store/store";
import { useTheme } from "@mui/material/styles";
import * as math from "mathjs";
import type { Layout, LegendClickEvent } from 'plotly.js';
import Plot from "react-plotly.js";
import { useZustand } from "use-zustand";


function generateData(
  sky: SkyPath,
  elevationCutoff: number,
  time: number,
  selectedSatellites: Set<number>,
  timeLabels: Array<string>
): Array<PlotXYObjectData> {
  const plotData: Array<PlotXYObjectData> = [];
  const specificTime = timeLabels[time];
  if (!specificTime) throw new Error('x is undefined');
  const specificTimeLine = generateSpecificTimeLine(time, -1, selectedSatellites.size);
  plotData.push(specificTimeLine);

  const colors = generateColorPalette(155);
  const selectedSatellitesArray = Array.from(selectedSatellites);

  for (let satelliteIndex = 0; satelliteIndex < selectedSatellites.size; satelliteIndex++) {
    const satelliteId = selectedSatellitesArray[satelliteIndex];
    if (!satelliteId) throw new Error('satelliteId is undefined')
    const satelliteData = sky.get(satelliteId);
    if (!satelliteData) {
      return [];
    }

    let color = colors[satelliteId % colors.length];
    if (color === undefined) {
      color = "white";
    }

    let currentLineX: number[] = [];

    for (let i = 0; i < satelliteData.length; i++) {
      const specificTimeData = satelliteData[i];
      if (specificTimeData === undefined) {
        continue;
      }
      let specificTimeElevation = specificTimeData[0];
      if (specificTimeElevation === undefined) {
        specificTimeElevation = 0;
      }

      if (specificTimeElevation > elevationCutoff) {
        currentLineX.push(i);
      } else if (currentLineX.length > 0) {
        const timeStamps = currentLineX.map((x) => timeLabels[x]);
        plotData.push({
          x: currentLineX,
          y: Array(currentLineX.length).fill(satelliteIndex),
          mode: 'lines',
          line: {
            color: color,
            width: 6,
          },
          name: satelliteId.toString(),
          hovertemplate: "%{text}",
          text: timeStamps.filter((ts) => ts !== undefined),
          showlegend: false,
          legendgroup: satelliteIDToName(satelliteId),
        });
        currentLineX = [];
      }
    }
    if (currentLineX.length > 0) {
      const timeStamps = currentLineX.map((x) => timeLabels[x]);
      plotData.push({
        x: currentLineX,
        y: Array(currentLineX.length).fill(satelliteIndex),
        mode: 'lines',
        line: {
          color: color,
          width: 6,
        },
        name: satelliteId.toString(),
        hovertemplate: "%{text}",
        text: timeStamps.filter((ts) => ts !== undefined),
        showlegend: false,
        legendgroup: satelliteIDToName(satelliteId),
      });
    }
    const specificTimeData = satelliteData[time]
    if (!specificTimeData) {
      continue;
    }
    const specificTimeElevation = specificTimeData[0];
    if (specificTimeElevation === undefined) {
      continue;
    }
    let specificTimeOfPoint = time;
    if (specificTimeElevation < elevationCutoff) {
      specificTimeOfPoint = -120;
    }
    const timeStamp = timeLabels[time] ?? '';
    plotData.push({
      x: [specificTimeOfPoint],
      y: [satelliteIndex],
      mode: 'markers',
      marker: {
        color: color,
        size: 10
      },
      name: satelliteIDToName(satelliteId),
      showlegend: true,
      legendgroup: satelliteIDToName(satelliteId),
      hovertemplate: "<b>%{text}</b>",
      text: [timeStamp],
    });
  }

  return plotData;
}


export default function VisibilityGraph() {
  const theme = useTheme()
  const sky = useZustand(useStore, (state) => state.sky)
  const time = useZustand(useStore, (state) => state.time)
  const selectedSatellites = useZustand(useStore, (state) => state.selectedSatellites)
  const changeSelectedSatellites = useZustand(useStore, (state) => state.changeSelectedSatellites)
  const elevationCutoff = useZustand(useStore, (state) => state.elevationCutoff)
  const timeLabels = generateTimeLabels();

  const layout = {
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
      range: [0, 144],
      fixedrange: true,
      tickvals: Array.from({ length: 13 }, (_, i) => i * 12),
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
      range: [-1, selectedSatellites.size],
      fixedrange: true,
      tickvals: math.range(0, selectedSatellites.size, 1).toArray().map(String),
      ticktext: Array.from(selectedSatellites).map(String),
    },
    legend: {
      tracegroupgap: 0
    },
  } satisfies Partial<Layout>

  const handleLegendClick = (event: Readonly<LegendClickEvent>) => {
    const clickedSatelliteName = event.data[event.curveNumber]?.name;
    if (!clickedSatelliteName) return false;
    const clickedSatelliteId = satelliteNameToID(clickedSatelliteName);
    const updatedSelectedSatellites = Array.from(selectedSatellites).filter(id => id !== clickedSatelliteId);
    const sortedSet = new Set(updatedSelectedSatellites.sort((a, b) => a - b));
    changeSelectedSatellites(sortedSet);
    return false;
  }

  return (
    <Plot
      data={generateData(sky, elevationCutoff, time, selectedSatellites, timeLabels)}
      layout={layout}
      config={{
        displayModeBar: false,
      }}
      style={{
        height: '100vh'
        , display: 'flex', alignItems: 'stretch'
      }}
      onLegendClick={handleLegendClick}
    />
  );
}
