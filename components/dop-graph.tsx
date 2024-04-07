import useStore from "@/store/store";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import * as math from "mathjs";
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
	DOP: Array<[number, number, number, number]>,
	time: number
): Array<Data> {
	const timeLabels = generateTimeLabels();
	if (!DOP) {
		return [];
	}
	const GDOPData: number[] = [];
	const TDOPData: number[] = [];
	const PDOPData: number[] = [];
	const HDOPData: number[] = [];
	const VDOPData: number[] = [];

	for (let i = 0; i < DOP.length; i++) {
		let DOPDataAtTime = DOP[i];
		if (DOPDataAtTime === undefined) {
			DOPDataAtTime = [0, 0, 0, 0];
		}
		const GDOPAtTime = math.sqrt(DOPDataAtTime[0]**2 + DOPDataAtTime[1]**2);
		if (GDOPAtTime === undefined) GDOPData.push(0);
		else GDOPData.push(GDOPAtTime as number);
		TDOPData.push(DOPDataAtTime[0]);
		PDOPData.push(DOPDataAtTime[1]);
		HDOPData.push(DOPDataAtTime[2]);
		VDOPData.push(DOPDataAtTime[3]);	
	}

	const specificTimeGDOP = GDOPData[time];
	const specificTimeGDOPPoint = {
		x: [timeLabels[time]],
		y: [specificTimeGDOP],
		mode: 'markers',
		marker: {
			color: 'blue',
			size: 10,
		},
		text: 'GDOP',
		textposition: "top center" as const,
		textfont: {
			color: "green",
			family: "Roboto Bold, Roboto, sans-serif",
			size: 16
		},
		name: 'GDOP',
		showlegend: true,
	};
	const specificTimeTDOP = TDOPData[time];
	const specificTimeTDOPPoint = {
		x: [timeLabels[time]],
		y: [specificTimeTDOP],
		mode: 'markers',
		marker: {
			color: 'red',
			size: 10,
		},
		name: 'TDOP',
		showlegend: true,
	};
	const specificTimePDOP = PDOPData[time];
	const specificTimePDOPPoint = {
		x: [timeLabels[time]],
		y: [specificTimePDOP],
		mode: 'markers',
		marker: {
			color: 'green',
			size: 10,
		},
		name: 'PDOP',
		showlegend: true,
	};
	const specificTimeHDOP = HDOPData[time];
	const specificTimeHDOPPoint = {
		x: [timeLabels[time]],
		y: [specificTimeHDOP],
		mode: 'markers',
		marker: {
			color: 'purple',
			size: 10,
		},
		name: 'HDOP',
		showlegend: true,
	};
	const specificTimeVDOP = VDOPData[time];
	const specificTimeVDOPPoint = {
		x: [timeLabels[time]],
		y: [specificTimeVDOP],
		mode: 'markers',
		marker: {
			color: 'orange',
			size: 10,
		},
		name: 'VDOP',
		showlegend: true,
	};

	const GDOPLine = {
		x: timeLabels,
		y: GDOPData,
		mode: 'lines',
		line: {
			color: 'blue',
			width: 2
		},
		name: 'GDOP',
		showlegend: false,
	};
	const TDOPLine = {
		x: timeLabels,
		y: TDOPData,
		mode: 'lines',
		line: {
			color: 'red',
			width: 2
		},
		name: 'TDOP',
		showlegend: false,
	};
	const PDOPLine = {
		x: timeLabels,
		y: PDOPData,
		mode: 'lines',
		line: {
			color: 'green',
			width: 2
		},
		name: 'PDOP',
		showlegend: false,
	};
	const HDOPLine = {
		x: timeLabels,
		y: HDOPData,
		mode: 'lines',
		line: {
			color: 'purple',
			width: 2
		},
		name: 'HDOP',
		showlegend: false,
	};
	const VDOPLine = {
		x: timeLabels,
		y: VDOPData,
		mode: 'lines',
		line: {
			color: 'orange',
			width: 2
		},
		name: 'VDOP',
		showlegend: false,
	};

	const specificTimeLine = {
		x: [timeLabels[time], timeLabels[time]],
		y: [0, 4],

		mode: 'lines',
		marker: {
			color: 'yellow',
			size: 10,
		},
		name: 'Specific Time',
		showlegend: false,
	};

	return [GDOPLine, TDOPLine, PDOPLine, HDOPLine, VDOPLine, specificTimeLine, specificTimeGDOPPoint, specificTimeTDOPPoint, specificTimePDOPPoint, specificTimeHDOPPoint, specificTimeVDOPPoint];	
}


const DOPGraph = () => {
	const theme = useTheme()
	const DOP = useZustand(useStore, (state) => state.DOP)
	const time = useZustand(useStore, (state) => state.time)

	const timeLabels = generateTimeLabels();

	return (
		<Plot
			data={generateData(DOP, time)}
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
					title: "DOP",
					showline: true,
					linecolor: theme.palette.text.primary,
					tickfont: {
						color: theme.palette.text.primary,
					},
					range: [0.25, 3],
					fixedrange: true,
				},
				showlegend: true,

			}}
			config={{
				displayModeBar: false,
			}}
		/>
	)
}

export default DOPGraph
