import dayjs from "dayjs"
import type { Data } from "plotly.js"

export function generateTimeLabels(): string[] {
	const timeLabels: string[] = []
	for (let i = 0; i < 144; i++) {
		const timeIncrement = i * 10
		const timeLabel = dayjs()
			.startOf("day")
			.add(timeIncrement, "minute")
			.format("HH:mm")
		timeLabels.push(timeLabel)
	}
	timeLabels.push("24:00")
	return timeLabels
}

export function generateColorPalette(numColors: number, cycles = 7): string[] {
	const colors = []
	for (let i = 0; i < numColors; i++) {
		const hue = ((360 * i * cycles) / numColors) % 360
		colors.push(`hsl(${hue}, 100%, 50%)`)
	}
	return colors
}

export function generateSpecificTimeLine(
	formattedTime: string,
	minVal: number,
	maxVal: number
): Data {
	const specificTimeLine = {
		x: [formattedTime, formattedTime],
		y: [minVal, maxVal],

		mode: "lines",
		marker: {
			color: "yellow",
			size: 10
		},
		name: "Specific Time",
		showlegend: false,
		hoverinfo: "none"
	}
	return specificTimeLine
}
