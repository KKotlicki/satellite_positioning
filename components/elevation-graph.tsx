import type { PlotXYObjectData, SkyPath } from '@/constants/types';
import { generateColorPalette, generateSpecificTimeLine, generateTimeLabels } from '@/services/graphUtilites';
import useStore from "@/store/store";
import { useTheme } from "@mui/material/styles";
import type { LegendClickEvent } from "plotly.js";
import Plot from "react-plotly.js";
import { useZustand } from "use-zustand";


function generateData(
	sky: SkyPath,
	time: number,
	elevationCutoff: number,
	selectedSatellites: Set<number>,
	timeLabels: string[]
): Array<PlotXYObjectData> {
	if (!timeLabels[time]) throw new Error('timeLabels is undefined')
	const plotData: Array<PlotXYObjectData> = [];
	const colors = generateColorPalette(155);
	const cutoffLine: PlotXYObjectData = {
		x: timeLabels,
		y: Array(144).fill(elevationCutoff),
		mode: 'lines',
		line: {
			color: 'cyan',
			width: 2
		},
		name: 'Elevation Cutoff',
		showlegend: false,
		hoverinfo: 'none',
	};
	const specificTime = timeLabels[time]
	if (!specificTime) throw new Error('x is undefined')
	const specificTimeLine = generateSpecificTimeLine(specificTime, elevationCutoff, 90);

	for (const satelliteId of Array.from(selectedSatellites)) {
		const satelliteData = sky.get(satelliteId);
		if (!satelliteData) {
			return [];
		}

		for (let i = 0; i < satelliteData.length; i++) {
			let satellitePosition = satelliteData[i];
			if (satellitePosition === undefined) {
				satellitePosition = [0, 0];
			}
			if (satellitePosition[0] === undefined) {
				satellitePosition[0] = 0;
			}
		}
		let color = colors[satelliteId % colors.length];
		if (color === undefined) {
			color = "white";
		}

		const specificTimeData = satelliteData[time];
		if (specificTimeData === undefined) {
			continue;
		}
		let specificTimeElevation = specificTimeData[0];
		if (specificTimeElevation === undefined) {
			continue;
		}

		const lineYValues = satelliteData.map(entry => {
			if (entry && entry[0] !== undefined) {
				if (entry[0] >= elevationCutoff) {
					return entry[0];
				}
				return elevationCutoff;
			}
			return undefined;
		}) as number[];

		const lineData: PlotXYObjectData = {
			x: timeLabels,
			y: lineYValues,
			mode: 'lines',
			name: satelliteId.toString(),
			line: {
				color: color,
				width: 2
			},
			showlegend: false,
			legendgroup: satelliteId.toString(),
		};
		plotData.push(lineData);

		if (specificTimeElevation < elevationCutoff) {
			specificTimeElevation = 91;
		}

		const specificTime = timeLabels[time]
		if (!specificTime) throw new Error('x is undefined')
		const specificTimePoint: PlotXYObjectData = {
			x: [specificTime],
			y: [specificTimeElevation],
			mode: 'text+markers' as const,
			marker: {
				color: color,
				size: 8
			},
			text: [satelliteId.toString()],
			textposition: "top center" as const,
			textfont: {
				color: color,
				family: "Roboto Bold, Roboto, sans-serif",
				size: 16
			},
			showlegend: true,
			name: satelliteId.toString(),
			legendgroup: satelliteId.toString(),
		};
		plotData.push(specificTimePoint);
	}

	plotData.push(cutoffLine);
	plotData.push(specificTimeLine);
	return plotData;
}


export default function ElevationGraph() {
	const theme = useTheme()
	const elevationCutoff = useZustand(useStore, (state) => state.elevationCutoff)
	const sky = useZustand(useStore, (state) => state.sky)
	const time = useZustand(useStore, (state) => state.time)
	const selectedSatellites = useZustand(useStore, (state) => state.selectedSatellites)
	const changeSelectedSatellites = useZustand(useStore, (state) => state.changeSelectedSatellites)

	const timeLabels = generateTimeLabels();

	const handleLegendClick = (event: Readonly<LegendClickEvent>) => {
		const clickedSatelliteId = Number(event.data[event.curveNumber]?.name);
		const updatedSelectedSatellites = Array.from(selectedSatellites).filter(id => id !== clickedSatelliteId);
		changeSelectedSatellites(new Set(updatedSelectedSatellites));
		return false;
	}

	return (
		<Plot
			data={generateData(sky, time, elevationCutoff, selectedSatellites, timeLabels)}
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
					range: [0, 144],
					fixedrange: true,
					tickvals: Array.from({ length: 13 }, (_, i) => i * 12),
					ticktext: timeLabels.filter((_, index) => index % 12 === 0),
				},
				yaxis: {
					title: "Elevation",
					showline: true,
					linecolor: theme.palette.text.primary,
					tickfont: {
						color: theme.palette.text.primary,
					},
					range: [0, 90],
					fixedrange: true,
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
			onLegendClick={handleLegendClick}
		/>
	)
}
