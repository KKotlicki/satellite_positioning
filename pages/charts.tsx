import { useResizeObserver } from "@/hooks/use-resize-observer";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { useRef } from "react";


const ElevationGraph = dynamic(() => import("../components/elevation-graph"), {
	ssr: false
})
const DOPGraph = dynamic(() => import("../components/dop-graph"), {
	ssr: false
})

export default function Charts() {
	const containerRef = useRef(null)
	useResizeObserver(containerRef)

	return (
		<Box
			ref={containerRef}
			display="flex"
			justifyContent="center"
			flexWrap={'wrap'}
		>
			<ElevationGraph />
			<DOPGraph />
		</Box>
	)
}
