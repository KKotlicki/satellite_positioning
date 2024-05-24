import { generateTimeLabels } from '@/services/graphUtilites';
import { useDOP, useSelectedTocs, useTime } from '@/stores/almanac-store';
import { useTheme } from "@mui/material/styles";
import dayjs from 'dayjs';
import Plot from "react-plotly.js";
import type { FullDOP } from './graph/dop-generate';
import generateDOPData from './graph/dop-generate';

export default function DOPGraph() {
  const theme = useTheme();
  const DOP = useDOP();
  const time = useTime();
  const selectedTocs = useSelectedTocs();

  let maxDOP = 0;
  const fullDOP: FullDOP = {
    GDOP: ['blue', []],
    TDOP: ['red', []],
    PDOP: ['green', []],
    HDOP: ['purple', []],
    VDOP: ['orange', []],
  };

  for (const toc of selectedTocs) {
    const DOPDataAtTime = DOP[toc];
    if (!DOPDataAtTime) continue;

    const { TDOP, PDOP, VDOP, HDOP } = DOPDataAtTime;

    let GDOP: number;
    if (TDOP === -1 || PDOP === -1 || VDOP === -1 || HDOP === -1) {
      GDOP = -1;
    } else {
      GDOP = Math.sqrt(PDOP ** 2 + TDOP ** 2);
    }

    fullDOP.GDOP[1].push(GDOP);
    fullDOP.TDOP[1].push(TDOP);
    fullDOP.PDOP[1].push(PDOP);
    fullDOP.HDOP[1].push(HDOP);
    fullDOP.VDOP[1].push(VDOP);

    if (GDOP !== -1) {
      maxDOP = Math.max(maxDOP, GDOP, TDOP, PDOP, HDOP, VDOP);
    }
  }

  maxDOP += 1;
  const timeLabels = generateTimeLabels(selectedTocs);
  const shortTimeLabels = selectedTocs.map(toc => dayjs.utc((toc + 315964800) * 1000).format('HH:mm'));

  return (
    <Plot
      data={generateDOPData(fullDOP, time, timeLabels, maxDOP)}
      layout={{
        autosize: true,
        margin: {
          pad: 0,
        },
        paper_bgcolor: theme.palette.background.default,
        plot_bgcolor: theme.palette.background.default,
        xaxis: {
          title: "Time",
          showline: true,
          linecolor: theme.palette.text.primary,
          tickfont: {
            color: theme.palette.text.primary,
          },
          range: [0, selectedTocs.length - 1],
          fixedrange: true,
          tickvals: Array.from({ length: Math.ceil(selectedTocs.length / 12) + 1 }, (_, i) => i * 12).filter(val => val < selectedTocs.length),
          ticktext: shortTimeLabels.filter((_, index) => index % 12 === 0),
        },
        yaxis: {
          title: "DOP",
          showline: true,
          linecolor: theme.palette.text.primary,
          tickfont: {
            color: theme.palette.text.primary,
          },
          range: [0, Math.min(20, maxDOP)],
          fixedrange: false,
          rangemode: "nonnegative"
        },
        showlegend: true,
        legend: {
          tracegroupgap: 0
        }
      }}
      config={{
        displayModeBar: false,
      }}
    />
  );
}
