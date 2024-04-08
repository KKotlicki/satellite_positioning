import useStore from "@/store/store";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import type { Data } from "plotly.js";
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

		let specificTimeData = satelliteData[time];
		if (specificTimeData === undefined) {
			specificTimeData = [0, 0];
		}
		let specificTimeElevation = specificTimeData[0];
		if (specificTimeElevation === undefined) {
			specificTimeElevation = 0;
		}


		const specificTimePoint = {
			x: [time],
			y: [specificTimeElevation],
			type: 'scatter' as const,
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
			name: `${satelliteId}`,
		};

		const lineData = {
			x: Array.from(Array(145).keys()),
			y: satelliteData.map(entry => entry ? entry[0] : 0),
			mode: 'lines',
			line: {
				color: color,
				width: 2
			},
			showlegend: false,
		};

		plotData.push(specificTimePoint);
		plotData.push(lineData);

	}
	plotData.push(cutoffLine);
	return plotData;
}


const ElevationGraph = () => {
	const theme = useTheme()
	const elevationCutoff = useZustand(useStore, (state) => state.elevationCutoff)
	const sky = useZustand(useStore, (state) => state.sky)
	const time = useZustand(useStore, (state) => state.time)
	const selectedSatellites = useZustand(useStore, (state) => state.selectedSatellites)

	const timeLabels = generateTimeLabels();

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
					range: [-90, 90],
				},
				showlegend: true,

			}}
			config={{
				displayModeBar: false,
			}}
		/>
	)
}

export default ElevationGraph
