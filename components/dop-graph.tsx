import type { PlotXYObjectData } from '@/constants/types';
import { generateSpecificTimeLine, generateTimeLabels } from '@/services/graphUtilites';
import useStore from "@/store/store";
import { useTheme } from "@mui/material/styles";
import * as math from "mathjs";
import Plot from "react-plotly.js";
import { useZustand } from "use-zustand";

type FullDOP = {
	GDOP: ['blue', number[]],
	TDOP: ['red', number[]],
	PDOP: ['green', number[]],
	HDOP: ['purple', number[]],
	VDOP: ['orange', number[]],
}


function generateSpecificTimeData(DOP: Array<number>, timeLabels: string[], color: string, name: string, time = -1): PlotXYObjectData {
	let timeDrawn = timeLabels;
	let specificDOP = DOP;
	let mode: 'lines' | 'markers' = 'lines';
	let showLegend = false
	let size = 2

	if (time !== -1) {
		const specificTime = timeLabels[time];
		if (!specificTime) throw new Error('timeLabels is undefined')
		timeDrawn = [specificTime]
		const specificTimeDOP = DOP[time];
		if (!specificTimeDOP) {
			throw new Error(`DOP is undefined at parameters\ntime:\n${time}\nDOP:\n${DOP}\nname:\n${name}`)
		}
		specificDOP = [specificTimeDOP];
		mode = 'markers';
		showLegend = true
		size = 10
	}
	const specificTimePoint = {
		x: timeDrawn,
		y: specificDOP,
		mode: mode,
		marker: {
			color: color,
			size: size,
		},
		name: name,
		showlegend: showLegend,
		legendgroup: `${name}`,
	};
	return specificTimePoint;
}

function generateData(
	fullDOP: FullDOP,
	time: number,
	timeLabels: string[],
	maxDOP: number
): Array<PlotXYObjectData> {
	if (!timeLabels[time]) throw new Error('timeLabels is undefined')
	const plotData: Array<PlotXYObjectData> = [];

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
	const specificTime = timeLabels[time];
	if (!specificTime) throw new Error('timeLabels is undefined')
	const specificTimeLine = generateSpecificTimeLine(specificTime, 0, maxDOP);
	plotData.push(specificTimeLine);
	for (const [name, [color, DOPData]] of Object.entries(fullDOP)) {
		plotData.push(generateSpecificTimeData(DOPData, timeLabels, color, name, time));
	}

	return plotData;
}


export default function DOPGraph() {
	const theme = useTheme()
	const DOP = useZustand(useStore, (state) => state.DOP)
	const time = useZustand(useStore, (state) => state.time)

	let maxDOP = 0;
	const fullDOP: FullDOP = {
		GDOP: ['blue', []],
		TDOP: ['red', []],
		PDOP: ['green', []],
		HDOP: ['purple', []],
		VDOP: ['orange', []],
	}

	for (let i = 0; i < DOP.length; i++) {
		const GDOP: number[] = [];
		const DOPDataAtTime = DOP[i];
		if (DOPDataAtTime === undefined || DOPDataAtTime.length !== 4) {
			throw new Error('DOPDataAtTime is undefined')
		}
		if (!DOPDataAtTime[0] || !DOPDataAtTime[1] || !DOPDataAtTime[2] || !DOPDataAtTime[3]) {
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
