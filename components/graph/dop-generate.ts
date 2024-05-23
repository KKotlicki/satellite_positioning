import type { PlotXYObjectData } from "@/global/types"
import { generateSpecificTimeLine } from "@/services/graphUtilites"

export type FullDOP = {
	GDOP: ["blue", number[]]
	TDOP: ["red", number[]]
	PDOP: ["green", number[]]
	HDOP: ["purple", number[]]
	VDOP: ["orange", number[]]
}

function generateSpecificTimeData(
	DOP: Array<number>,
	timeLabels: string[],
	color: string,
	name: string,
	time = -1
): PlotXYObjectData {
	let timeDrawn = timeLabels
	let specificDOP = DOP
	let mode: "lines" | "markers" = "lines"
	let showLegend = false
	let size = 2

	if (time !== -1) {
		const specificTime = timeLabels[time]
		if (!specificTime) throw new Error("timeLabels is undefined")
		timeDrawn = [specificTime]
		const specificTimeDOP = DOP[time]
		if (specificTimeDOP === undefined) {
			throw new Error(
				`DOP is undefined at parameters\ntime:\n${time}\nDOP:\n${DOP}\nname:\n${name}`
			)
		}
		specificDOP = [specificTimeDOP]
		mode = "markers"
		showLegend = true
		size = 10
	}
	const specificTimePoint = {
		x: timeDrawn,
		y: specificDOP,
		mode: mode,
		marker: {
			color: color,
			size: size
		},
		name: name,
		showlegend: showLegend,
		legendgroup: `${name}`
	}
	return specificTimePoint
}

export default function generateDOPData(
	fullDOP: FullDOP,
	time: number,
	timeLabels: string[],
	maxDOP: number
): Array<PlotXYObjectData> {
	if (!timeLabels[time]) throw new Error("timeLabels is undefined")
	const plotData: Array<PlotXYObjectData> = []

	if (
		!fullDOP ||
		!fullDOP.GDOP ||
		!fullDOP.TDOP ||
		!fullDOP.PDOP ||
		!fullDOP.HDOP ||
		!fullDOP.VDOP ||
		fullDOP.GDOP[1].length === 0 ||
		fullDOP.TDOP[1].length === 0 ||
		fullDOP.PDOP[1].length === 0
	) {
		const specificTimeLine = generateSpecificTimeLine(String(time), 0, maxDOP)
		plotData.push(specificTimeLine)
		return plotData
	}

	for (const [name, [color, DOPData]] of Object.entries(fullDOP)) {
		plotData.push(generateSpecificTimeData(DOPData, timeLabels, color, name))
	}
	const specificTime = timeLabels[time]
	if (!specificTime) throw new Error("timeLabels is undefined")
	const specificTimeLine = generateSpecificTimeLine(specificTime, 0, maxDOP)
	plotData.push(specificTimeLine)
	for (const [name, [color, DOPData]] of Object.entries(fullDOP)) {
		plotData.push(
			generateSpecificTimeData(DOPData, timeLabels, color, name, time)
		)
	}

	return plotData
}
