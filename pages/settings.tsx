import ElevationPicker from "@/components/settings/elevation";
import HeightPicker from "@/components/settings/height";
import LatitudePicker from "@/components/settings/latitude";
import LongitudePicker from "@/components/settings/longitude";
import UploadZone from "@/components/settings/upload_zone";
import {
	Box,
	Card,
	CardContent,
	CardHeader,
	useTheme
} from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const DatePicker = dynamic(() => import("../components/settings/date-picker"), {
	ssr: false
})

const Settings = () => {
	const theme = useTheme()
	const containerRef = useRef(null)
	const [size, setSize] = useState(0)
	const [margin, setMargin] = useState(0)

	useEffect(() => {
		const handleResize = () => {
			const drawer = document.querySelector(".MuiDrawer-root") as HTMLElement
			const drawerWidth = drawer ? drawer.offsetWidth : 0
			const availableWidth = window.innerWidth - drawerWidth

			const targetSize = availableWidth * 0.5
			const targetMargin = availableWidth * 0.05

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
			width="100%"
			height="100%"
			marginTop={margin / 16}
		>
			<Card
				sx={{
					width: size,
				}}
				variant='outlined'
			>
				<CardHeader
					title='Settings'
					style={{
						borderBottom: `1px solid ${theme.palette.divider}`,
						backgroundColor: theme.palette.divider
					}}
				/>
				<CardContent>
					<LatitudePicker />
					<LongitudePicker />
					<HeightPicker />
					<ElevationPicker />
					<DatePicker />
					<UploadZone />
				</CardContent>
			</Card>
		</Box>
	)
}

export default Settings
