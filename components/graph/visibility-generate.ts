import type {
	PlotXYObjectData,
	SelectedSatellites,
	SkyPath
} from "@/global/types"
import {
	generateColorPalette,
	generateSpecificTimeLine
} from "@/services/graphUtilites"

export default function generateVisibilityData(
	sky: SkyPath,
	elevationCutoff: number,
	time: number,
	selectedSatellites: SelectedSatellites,
	selectedTocs: number[]
): Array<PlotXYObjectData> {
	const plotData: Array<PlotXYObjectData> = []
	const elevationCutoffRadians = elevationCutoff * (Math.PI / 180)
	const colors = generateColorPalette(155)
	let colorIndex = 0

	const timeLabels = selectedTocs.map((toc) =>
		new Date((toc + 315964800) * 1000).toISOString().substr(11, 5)
	)

	const selectedSatellitesArray = Object.entries(selectedSatellites).flatMap(
		([_, sats]) =>
			Object.keys(sats || {}).filter((prn) => sats?.[prn]?.isSelected)
	)

	const specificTimeLine = generateSpecificTimeLine(
		time,
		-1,
		selectedSatellitesArray.length
	)
	if (specificTimeLine.line) {
		specificTimeLine.line.width = 2
	}
	plotData.push(specificTimeLine)

	for (
		let satelliteIndex = 0;
		satelliteIndex < selectedSatellitesArray.length;
		satelliteIndex++
	) {
		const satelliteId = selectedSatellitesArray[satelliteIndex]
		if (!satelliteId) continue
		const satelliteData = sky[satelliteId]
		if (!satelliteData) continue

		const color = colors[colorIndex % colors.length]
		if (color === undefined) continue
		colorIndex++

		let currentLineX: number[] = []
		let currentLineY: number[] = []

		for (let i = 0; i < selectedTocs.length; i++) {
			const timeKey = selectedTocs[i]
			if (!timeKey) continue
			const specificTimeData = satelliteData[timeKey]
			if (!specificTimeData) continue
			const specificTimeElevation = specificTimeData.elevation
			if (specificTimeElevation === undefined) continue

			if (specificTimeElevation > elevationCutoffRadians) {
				currentLineX.push(i)
				currentLineY.push(satelliteIndex)
			} else if (currentLineX.length > 0) {
				plotData.push({
					x: currentLineX,
					y: currentLineY,
					mode: "lines",
					line: {
						color: color,
						width: 6
					},
					name: satelliteId,
					hovertemplate: "<b>%{text}</b>",
					text: currentLineX
						.map((x) => timeLabels[x])
						.filter((label) => label !== undefined),
					showlegend: false,
					legendgroup: satelliteId
				})
				currentLineX = []
				currentLineY = []
			}
		}

		if (currentLineX.length > 0) {
			plotData.push({
				x: currentLineX,
				y: currentLineY,
				mode: "lines",
				line: {
					color: color,
					width: 6
				},
				name: satelliteId,
				hovertemplate: "<b>%{text}</b>",
				text: currentLineX
					.map((x) => timeLabels[x])
					.filter((label) => label !== undefined),
				showlegend: false,
				legendgroup: satelliteId
			})
		}

		const specificTimeKey = selectedTocs[time]
		if (!specificTimeKey) continue
		const specificTimeData = satelliteData[specificTimeKey]
		if (!specificTimeData) continue
		const specificTimeElevation = specificTimeData.elevation
		if (specificTimeElevation === undefined) continue
		const timeLabel = timeLabels[time]
		if (!timeLabel) continue

		const specificTimeOfPoint =
			specificTimeElevation >= elevationCutoffRadians ? time : -120
		plotData.push({
			x: [specificTimeOfPoint],
			y: [satelliteIndex],
			mode: "markers",
			marker: {
				color: color,
				size: 10
			},
			name: satelliteId,
			showlegend: true,
			legendgroup: satelliteId,
			hovertemplate: "<b>%{text}</b>",
			text: [timeLabel]
		})
	}

	return plotData
}
