import { generateSpecificTimeLine, generateTimeLabels } from "@/services/graphUtilites";
import useStore from "@/store/store";
import { useTheme } from "@mui/material/styles";
import * as math from "mathjs";
import type { Data } from "plotly.js";
import Plot from "react-plotly.js";
import { useZustand } from "use-zustand";

function generateSpecificTimeData(DOP: Array<number>, timeLabels: string[], color: string, name: string, time = -1): Data {
	let timeDrawn = timeLabels;
	let specificDOP = DOP;
	let mode = 'line'
	let showLegend = false
	let size = 2

	if (time !== -1) {
		if (!timeLabels[time]) throw new Error('timeLabels is undefined')
		timeDrawn = [timeLabels[time]]
		if (!DOP[time]) {
			throw new Error(`DOP is undefined at parameters\ntime:\n${time}\nDOP:\n${DOP}\nname:\n${name}`)
		}
		specificDOP = [DOP[time]];
		mode = 'markers'
		showLegend = true
		size = 10
	}

	const specificTimePoint = {
		x: timeDrawn,
		y: specificDOP,
		mode: mode,
		marker: {
			color: color,
			size: 10,
		},
		name: name,
		showlegend: showLegend,
		legendgroup: `${name}`,
	};
	return specificTimePoint;
}

function generateData(
	fullDOP: {
		GDOP: ['blue', number[]],
		TDOP: ['red', number[]],
		PDOP: ['green', number[]],
		HDOP: ['purple', number[]],
		VDOP: ['orange', number[]],
	},
	time: number,
	timeLabels: string[],
	maxDOP: number
): Array<Data> {
	if (!timeLabels[time]) throw new Error('timeLabels is undefined')
	const plotData: Array<Data> = [];

	if (!fullDOP || !fullDOP.GDOP || !fullDOP.TDOP || !fullDOP.PDOP || !fullDOP.HDOP || !fullDOP.VDOP
		|| fullDOP.GDOP[1].length === 0 || fullDOP.TDOP[1].length === 0 || fullDOP.PDOP[1].length === 0
	) {
		const specificTimeLine = generateSpecificTimeLine(String(time), 0, maxDOP);
		plotData.push(specificTimeLine);
		return plotData;
	}

	for (const [name, [color, DOPData]] of Object.entries(fullDOP)) {
		plotData.push(generateSpecificTimeData(DOPData, timeLabels, color, name));
	}
	const specificTimeLine = generateSpecificTimeLine(timeLabels[time], 0, maxDOP);
	plotData.push(specificTimeLine);
	for (const [name, [color, DOPData]] of Object.entries(fullDOP)) {
		plotData.push(generateSpecificTimeData(DOPData, timeLabels, color, name, time));
	}

	return plotData;
}


const DOPGraph = () => {
	const theme = useTheme()
	const DOP = useZustand(useStore, (state) => state.DOP)
	const time = useZustand(useStore, (state) => state.time)

	let maxDOP = 0;
	const fullDOP: {
		GDOP: ['blue', number[]],
		TDOP: ['red', number[]],
		PDOP: ['green', number[]],
		HDOP: ['purple', number[]],
		VDOP: ['orange', number[]],
	} = {
		GDOP: ['blue', []],
		TDOP: ['red', []],
		PDOP: ['green', []],
		HDOP: ['purple', []],
		VDOP: ['orange', []],
	}

	for (let i = 0; i < DOP.length; i++) {
		const GDOP: number[] = [];
		const DOPDataAtTime = DOP[i];
		if (DOPDataAtTime === undefined) {
			throw new Error('DOPDataAtTime is undefined')
		}
		if (DOPDataAtTime[0] === -1 || DOPDataAtTime[2] === -1) GDOP.push(-1);
		else {
			const GDOPAtTime = math.sqrt(DOPDataAtTime[0] ** 2 + DOPDataAtTime[1] ** 2);
			if (GDOPAtTime === undefined) GDOP.push(-1);
			else GDOP.push(GDOPAtTime as number);
		}
		if (!GDOP[0]) throw new Error('GDOP is undefined')
		fullDOP.GDOP[1].push(GDOP[0]);
		fullDOP.TDOP[1].push(DOPDataAtTime[2]);
		fullDOP.PDOP[1].push(DOPDataAtTime[3]);
		fullDOP.HDOP[1].push(DOPDataAtTime[1]);
		fullDOP.VDOP[1].push(DOPDataAtTime[0]);
		if (GDOP[0] === -1) continue;
		if (GDOP[0] > maxDOP) maxDOP = GDOP[0];
		if (DOPDataAtTime[2] > maxDOP) maxDOP = DOPDataAtTime[2];
		if (DOPDataAtTime[3] > maxDOP) maxDOP = DOPDataAtTime[3];
		if (DOPDataAtTime[1] > maxDOP) maxDOP = DOPDataAtTime[1];
		if (DOPDataAtTime[0] > maxDOP) maxDOP = DOPDataAtTime[0];
	}
	maxDOP += 1;

	const timeLabels = generateTimeLabels();
	console.log(generateData(fullDOP, time, timeLabels, maxDOP))
	return (
		<Plot
			data={generateData(fullDOP, time, timeLabels, maxDOP)}
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
	)
}

export default DOPGraph
