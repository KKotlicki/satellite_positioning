import SatelliteSelection from "@/components/satellite-selection";
import useStore from "@/store/store";
import { Box, Card, CardContent, CardHeader, Tab, Tabs } from "@mui/material";
import {
	blue,
	green,
	orange,
	pink,
	red
} from "@mui/material/colors";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useZustand } from "use-zustand";

const VisibilityGraph = dynamic(() => import("../components/visibility-graph"), { ssr: false })


export default function Selection() {
	const containerRef = useRef(null)
	const almanacName = useZustand(useStore, (state) => state.almanacName)
	const [size, setSize] = useState(0)
	const [margin, setMargin] = useState(0)
	const [selectedTab, setSelectedTab] = useState(0);

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

	const handleChangeTab = (_event: React.ChangeEvent<unknown>, newValue: number) => {
		setSelectedTab(newValue);
	};

	return (
		<Box
			ref={containerRef}
			alignItems={'start'}
			width="100%"
			margin={margin / 16}
			display="grid"
			gridTemplateColumns={"repeat(2, 1fr)"}
			justifyContent="center"
			style={{ fontFamily: 'monospace', height: '100%' }}
		>
			<Card
				sx={{
					width: size,
				}}
				variant="outlined"
			>
				<CardHeader
					title={
						<Tabs value={selectedTab} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto"
							sx={{
								'.MuiTabs-flexContainer': {
									justifyContent: 'center',
								},
								width: '100%',
							}}
						>
							<Tab label={<b>GPS</b>} style={{ color: green[800] }} />
							<Tab label={<b>GLONASS</b>} style={{ color: red[800] }} />
							<Tab label={<b>Galileo</b>} style={{ color: blue[800] }} />
							<Tab label={<b>Beidou</b>} style={{ color: orange[800] }} />
							<Tab label={<b>QZSS</b>} style={{ color: pink[800] }} />
						</Tabs>
					}
					sx={{
						borderBottom: 1,
						borderColor: 'divider',
						backgroundColor: 'divider',
						display: 'flex',
						justifyContent: 'center',
						width: '100%',
					}}
				/>

				<CardContent>
					<SatelliteSelection provider={selectedTab} />
				</CardContent>
			</Card>
			{almanacName ? <VisibilityGraph /> : null}
		</Box>
	);
};
