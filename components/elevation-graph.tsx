import useStore from "@/store/store";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { Data } from "plotly.js";
import Plot from "react-plotly.js";
import { useZustand } from "use-zustand";

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
	elevationCutoff: number
): Array<Data> {
	const satelliteId = 2;
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
	const timeLabels = generateTimeLabels();


	const cutoffLine = {
		x: timeLabels,
		y: Array(satelliteData.length).fill(elevationCutoff),
		mode: 'lines',
		line: {
			color: 'cyan',
			width: 2
		},
		name: 'Elevation Cutoff',
		showlegend: false,
	};

	let specificTimeData = satelliteData[time];
	if (specificTimeData === undefined) {
		specificTimeData = [0, 0];
	}
	let specificTimeElevation = specificTimeData[0];
	if (specificTimeElevation === undefined) {
		specificTimeElevation = 0;
	}
	let specificTimeLabel = timeLabels[time];
	if (specificTimeLabel === undefined) {
		specificTimeLabel = "00:00";
	}


	const specificTimePoint = {
		x: [specificTimeLabel],
		y: [specificTimeElevation],
		type: 'scatter' as const,
		mode: 'text+markers' as const,
		marker: {
			color: 'green',
			size: 8
		},
		text: `G${satelliteId.toString().padStart(2, '0')}`,
		textposition: "top center" as const,
		textfont: {
			color: "green",
			family: "Roboto Bold, Roboto, sans-serif",
			size: 16
		},
		name: `G${satelliteId.toString().padStart(2, '0')}`,
	};

	const lineData = {
		x: timeLabels.slice(0, satelliteData.length),
		y: satelliteData.map(entry => entry ? entry[0] : 0),
		mode: 'lines',
		line: {
			color: 'green',
			width: 2
		},
		name: `G${satelliteId.toString().padStart(2, '0')}`,
		showlegend: false,
	};

	const plotData = [lineData, cutoffLine, specificTimePoint];

	return plotData;
}


const ElevationGraph = () => {
	const theme = useTheme()
	const elevationCutoff = useZustand(useStore, (state) => state.elevationCutoff)
	const sky = useZustand(useStore, (state) => state.sky)
	const time = useZustand(useStore, (state) => state.time)

	const timeLabels = generateTimeLabels();

	return (
			<Plot
				data={generateData(sky, time, elevationCutoff)}
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
