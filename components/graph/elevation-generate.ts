import type {
	PlotXYObjectData,
	SelectedSatellites,
	SkyPath
} from "@/global/types"
import {
	generateColorPalette,
	generateSpecificTimeLine
} from "@/services/graphUtilites"

export default function generateElevationData(
	sky: SkyPath,
	time: number,
	elevationCutoff: number,
	selectedSatellites: SelectedSatellites,
	selectedTocs: number[],
	timeLabels: string[]
): Array<PlotXYObjectData> {
	const timeLabel = timeLabels[time]
	if (!timeLabel) throw new Error("timeLabels is undefined")
	const plotData: Array<PlotXYObjectData> = []
	const colors = generateColorPalette(155)

	const cutoffLine: PlotXYObjectData = {
		x: timeLabels,
		y: Array(selectedTocs.length).fill(elevationCutoff),
		mode: "lines",
		line: {
			color: "cyan",
			width: 2
		},
		name: "Elevation Cutoff",
		showlegend: false,
		hoverinfo: "none"
	}

	const specificTimeLine = generateSpecificTimeLine(
		timeLabel,
		elevationCutoff,
		90
	)

	let colorIndex = 0

	for (const [_, sats] of Object.entries(selectedSatellites)) {
		for (const [prn, satData] of Object.entries(sats)) {
			if (!satData.isSelected) continue

			const satelliteData = sky[prn]
			if (!satelliteData) continue

			const color = colors[colorIndex % colors.length]
			if (color === undefined) continue
			colorIndex++

			const selectedToc = selectedTocs[time]
			if (selectedToc === undefined) continue
			const specificTimeData = satelliteData[selectedToc]
			if (!specificTimeData) continue

			const specificTimeElevation =
				specificTimeData.elevation !== undefined
					? specificTimeData.elevation * (180 / Math.PI)
					: 0

			const lineXValues: string[] = []
			const lineYValues: number[] = []

			selectedTocs.forEach((toc, index) => {
				const entry = satelliteData[toc]
				if (entry && entry.elevation !== undefined) {
					const elevationDegrees = entry.elevation * (180 / Math.PI)
					const timeLabel = timeLabels[index]
					if (!timeLabel) return
					lineXValues.push(timeLabel)
					lineYValues.push(
						elevationDegrees >= elevationCutoff
							? elevationDegrees
							: elevationCutoff
					)
				}
			})

			const lineData: PlotXYObjectData = {
				x: lineXValues,
				y: lineYValues,
				mode: "lines",
				name: prn,
				line: {
					color: color,
					width: 2
				},
				showlegend: false,
				legendgroup: prn
			}
			plotData.push(lineData)

			const specificTimePoint: PlotXYObjectData = {
				x: [timeLabel],
				y: [
					specificTimeElevation >= elevationCutoff ? specificTimeElevation : 91
				],
				mode: "text+markers",
				marker: {
					color: color,
					size: 8
				},
				text: [prn],
				textposition: "top center",
				textfont: {
					color: color,
					family: "Roboto Bold, Roboto, sans-serif",
					size: 16
				},
				showlegend: true,
				name: prn,
				legendgroup: prn
			}
			plotData.push(specificTimePoint)
		}
	}

	plotData.push(cutoffLine)
	plotData.push(specificTimeLine)
	return plotData
}
