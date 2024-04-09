import useStore from "@/store/store";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import type { Data, LegendClickEvent } from "plotly.js";
import Plot from "react-plotly.js";
import { useZustand } from "use-zustand";

function generateColorPalette(numColors: number, cycles = 7): string[] {
	const colors = [];
	for (let i = 0; i < numColors; i++) {
		const hue = (360 * i * cycles / numColors) % 360;
		colors.push(`hsl(${hue}, 100%, 50%)`);
	}
	return colors;
}

function generateTimeLabels() {
	const timeLabels: string[] = [];
	for (let i = 0; i < 144; i++) {
		const timeIncrement = i * 10;
		const timeLabel = dayjs().startOf('day').add(timeIncrement, 'minute').format('HH:mm');
		timeLabels.push(timeLabel);
	}
	timeLabels.push("24:00");
	return timeLabels;
}

function generateData(
	sky: Map<number, [number | undefined, number][]>,
	time: number,
	elevationCutoff: number,
	selectedSatellites: number[]
): Array<Data> {
	const timeLabels = generateTimeLabels();
	const plotData: Array<Data> = [];
	const colors = generateColorPalette(155);
	const cutoffLine = {
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
	const specificTimeLine = {
		x: [timeLabels[time], timeLabels[time]],
		y: [elevationCutoff, 90],

		mode: 'lines',
		marker: {
			color: 'yellow',
			size: 10,
		},
		name: 'Specific Time',
		showlegend: false,
		hoverinfo: 'none',
	};



	for (const satelliteId of selectedSatellites) {
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
		});

		const lineData = {
			x: timeLabels,
			y: lineYValues,
			mode: 'lines',
			line: {
				color: color,
				width: 2
			},
			showlegend: false,
			legendgroup: `${satelliteId}`,
		};
		plotData.push(lineData);

		if (specificTimeElevation < elevationCutoff) {
			specificTimeElevation = 91;
		}

		const specificTime = timeLabels[time]
		if (!specificTime) throw new Error('x is undefined')
		const specificTimePoint: Data = {
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
			name: `${satelliteId}`,
			legendgroup: `${satelliteId}`,
		};
		plotData.push(specificTimePoint);

	}

	plotData.push(cutoffLine);
	plotData.push(specificTimeLine);
	return plotData;
}


const ElevationGraph = () => {
	const theme = useTheme()
	const elevationCutoff = useZustand(useStore, (state) => state.elevationCutoff)
	const sky = useZustand(useStore, (state) => state.sky)
	const time = useZustand(useStore, (state) => state.time)
	const selectedSatellites = useZustand(useStore, (state) => state.selectedSatellites)
	const changeSelectedSatellites = useZustand(useStore, (state) => state.changeSelectedSatellites)

	const timeLabels = generateTimeLabels();

	const handleLegendClick = (event: Readonly<LegendClickEvent>) => {
		const clickedSatelliteId = Number(event.data[event.curveNumber]?.name);
		console.log(clickedSatelliteId);
		const updatedSelectedSatellites = selectedSatellites.filter(id => id !== clickedSatelliteId);
		changeSelectedSatellites(updatedSelectedSatellites);
		return false;
	}

	return (
		<Plot
			data={generateData(sky, time, elevationCutoff, selectedSatellites)}
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
					range: [0, 145],
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

export default ElevationGraph
