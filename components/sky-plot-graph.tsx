import type { SkyPath } from "@/global/types";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { useElevationCutoff, useSelectedSatellites, useSky, useTime } from "@/stores/almanac-store";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { Data } from "plotly.js";
import { useRef } from "react";
import Plot from "react-plotly.js";
import { satelliteIDToName } from '../services/astronomy';


function generateColorPalette(numColors: number, cycles = 7): string[] {
	const colors = [];
	for (let i = 0; i < numColors; i++) {
		const hue = (360 * i * cycles / numColors) % 360;
		colors.push(`hsl(${hue}, 100%, 50%)`);
	}
	return colors;
}

function generateData(
	sky: SkyPath,
	time: number,
	elevationCutoff: number,
	selectedSatellites: Set<number>
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

	const colors = generateColorPalette(155);

	for (const satelliteNumber of Array.from(selectedSatellites.values())) {

		const satelliteMap = sky.get(satelliteNumber)
		if (!satelliteMap) return data

		const satellitePoint = satelliteMap[time]
		if (satellitePoint === undefined) return data
		if (satellitePoint[0] === undefined) satellitePoint[0] = 0

		const colorIndex = (satelliteNumber - 1) % colors.length;
		let color = colors[colorIndex];
		if (color === undefined) {
			color = "white"
		}

		if (satellitePoint[0] >= elevationCutoff) {
			const [elevation, azimuth] = satelliteMap[time] as [number, number]
			data.push({
				type: "scatterpolar",
				r: [elevation],
				theta: [azimuth],
				mode: "text+markers",
				marker: { size: 16, color: color },
				hovertemplate: "%{r}°, %{theta}<extra></extra>",
				text: [satelliteIDToName(satelliteNumber)],
				textposition: "top center",
				textfont: {
					color: color,
					family: "Roboto Bold, Roboto, sans-serif",
					size: 16
				}
			})
		}
	}
	return data
}


export default function SkyPlotGraph() {

	const elevationCutoff = useElevationCutoff()
	const sky = useSky()
	const time = useTime()
	const selectedSatellites = useSelectedSatellites()


	const theme = useTheme()
	const containerRef = useRef(null)
	const { margin, size } = useResizeObserver(containerRef)

	return (
		<Box
			ref={containerRef}
			display="flex"
			justifyContent="center"
			width="100%"
			height="100%"
		>
			<Plot
				data={generateData(sky, time, elevationCutoff, selectedSatellites)}
				layout={{
					width: size,
					height: size,
					font: {
						family: "Roboto, sans-serif",
						color: theme.palette.text.primary
					},
					paper_bgcolor: theme.palette.background.paper,
					polar: {
						bgcolor: theme.palette.divider,
						radialaxis: {
							visible: true,
							range: [90, 0],
							linecolor: theme.palette.text.primary,
							gridcolor: theme.palette.text.secondary,
							tickvals: [30, 60],
							showticklabels: false
						},
						angularaxis: {
							linecolor: theme.palette.text.primary,
							gridcolor: theme.palette.text.secondary,
							rotation: 90,
							direction: "clockwise"
						}
					},
					margin: {
						l: margin,
						r: margin,
						b: margin,
						t: margin
					},
					showlegend: false
				}}
				config={{
					displayModeBar: false,
				}}
				useResizeHandler={true}
			/>
		</Box>
	)
}
