import type { PlotXYObjectData } from "@/global/types";
import dayjs from 'dayjs';

export function generateTimeLabels(selectedTocs: number[]): string[] {
  return selectedTocs.map(toc => dayjs.utc((toc + 315964800) * 1000).format("DD/MM/YYYY HH:mm:ss"));
}

export function generateColorPalette(numColors: number, cycles = 7): string[] {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = ((360 * i * cycles) / numColors) % 360;
    colors.push(`hsl(${hue}, 100%, 50%)`);
  }
  return colors;
}

export function generateSpecificTimeLine(
  formattedTime: string | number,
  minVal: number,
  maxVal: number
): PlotXYObjectData {
  let xValues: string[] | number[];
  if (typeof formattedTime === "string") {
    xValues = [formattedTime, formattedTime];
  } else {
    xValues = [formattedTime, formattedTime];
  }

  return {
    x: xValues,
    y: [minVal, maxVal],
    mode: "lines",
    line: {
      color: "yellow",
      width: 2,
    },
    name: "Specific Time",
    showlegend: false,
    hoverinfo: "none",
  };
}
