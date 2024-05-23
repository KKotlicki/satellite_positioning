import type { SelectedSatellites, SkyPath } from "@/global/types"
import { generateColorPalette } from "@/services/graphUtilites"
import type { Data } from "plotly.js"

export function generateSkyplotData(
	sky: SkyPath,
	currentTimeInSeconds: number,
	elevationCutoff: number,
	selectedSatellites: SelectedSatellites
): Array<Data> {
	const data: Array<Data> = []

	const numPoints = 1000
	const thetaValues = Array.from(
		{ length: numPoints },
		(_, i) => (i * 360) / numPoints
	)
	thetaValues.push(0)
	const rValues = new Array(numPoints + 1).fill(elevationCutoff)
	data.push({
		type: "scatterpolar",
		r: rValues,
		theta: thetaValues,
		mode: "lines",
		line: { color: "cyan", width: 2 }
	})

	const colors = generateColorPalette(155)
	let colorIndex = 0

	for (const [_, sats] of Object.entries(selectedSatellites)) {
		for (const [prn, satData] of Object.entries(sats)) {
			if (!satData.isSelected) continue

			const satelliteData = sky[prn]
			if (!satelliteData) continue

			const satellitePoint = satelliteData[currentTimeInSeconds]
			if (!satellitePoint) continue

			const { elevation, azimuth } = satellitePoint
			const color = colors[colorIndex % colors.length]
			colorIndex++

			if (color === undefined) continue

			if (elevation === undefined) continue
			const elevationDegrees = elevation * (180 / Math.PI)
			if (elevationDegrees >= elevationCutoff) {
				data.push({
					type: "scatterpolar",
					r: [elevationDegrees],
					theta: [azimuth * (180 / Math.PI)],
					mode: "text+markers",
					marker: { size: 16, color: color },
					hovertemplate: "Elevation: %{r}°, Azimuth: %{theta}°<extra></extra>",
					text: [prn],
					textposition: "top center",
					textfont: {
						color: color,
						family: "Roboto Bold, Roboto, sans-serif",
						size: 16
					}
				})
			}
		}
	}

	return data
}
