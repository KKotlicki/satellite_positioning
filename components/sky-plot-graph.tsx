import { useResizeObserver } from "@/hooks/use-resize-observer"
import {
	useElevationCutoff,
	useSelectedSatellites,
	useSelectedTocs,
	useSky,
	useTime
} from "@/services/store"
import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRef } from "react"
import Plot from "react-plotly.js"
import { generateSkyplotData } from "./graph/skyplot-generate"

export default function SkyPlotGraph() {
	const elevationCutoff = useElevationCutoff()
	const sky = useSky()
	const time = useTime()
	const selectedSatellites = useSelectedSatellites()
	const selectedTocs = useSelectedTocs()
	const theme = useTheme()
	const containerRef = useRef(null)
	const { margin, size } = useResizeObserver(containerRef)

	const currentTimeInSeconds = selectedTocs[time]
	if (currentTimeInSeconds === undefined) return <></>

	return (
		<Box
			ref={containerRef}
			display='flex'
			justifyContent='center'
			width='100%'
			height='100%'
		>
			<Plot
				data={generateSkyplotData(
					sky,
					currentTimeInSeconds,
					elevationCutoff,
					selectedSatellites
				)}
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
					displayModeBar: false
				}}
				useResizeHandler={true}
			/>
		</Box>
	)
}
