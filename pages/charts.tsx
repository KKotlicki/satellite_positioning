import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ElevationGraph = dynamic(() => import("../components/elevation-graph"), {
	ssr: false
})
const DOPGraph = dynamic(() => import("../components/dop-graph"), {
	ssr: false
})

const Charts = () => {
	const containerRef = useRef(null)
	const [, setSize] = useState(0)
	const [, setMargin] = useState(0)

	useEffect(() => {
		const handleResize = () => {
			const navbar = document.querySelector(".MuiAppBar-root") as HTMLElement
			const navbarHeight = navbar ? navbar.offsetHeight : 0
			const availableHeight = window.innerHeight - navbarHeight
			const drawer = document.querySelector(".MuiDrawer-root") as HTMLElement
			const drawerWidth = drawer ? drawer.offsetWidth : 0
			const availableWidth = window.innerWidth - drawerWidth

			const targetSize = Math.min(availableWidth, availableHeight) * 0.8
			const targetMargin = Math.min(availableWidth, availableHeight) * 0.1

			if (containerRef.current) {
				setSize(targetSize)
				setMargin(targetMargin)
			}
		}

		handleResize()
		window.addEventListener("resize", handleResize)

		const resizeObserver = new ResizeObserver(handleResize)
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current)
		}

		return () => {
			window.removeEventListener("resize", handleResize)
			if (containerRef.current) {
				resizeObserver.unobserve(containerRef.current)
			}
		}
	})

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

export default Charts
