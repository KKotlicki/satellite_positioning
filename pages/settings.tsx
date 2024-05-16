import ElevationPicker from "@/components/settings/elevation";
import HeightPicker from "@/components/settings/height";
import LatitudePicker from "@/components/settings/latitude";
import LongitudePicker from "@/components/settings/longitude";
import UploadZone from "@/components/settings/upload_zone";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { useAlmanacFile } from "@/stores/almanac-store";
import { Box, Card, CardContent, CardHeader, useTheme } from "@mui/material";
import dynamic from "next/dynamic";
import { useRef } from "react";

const DatePicker = dynamic(() => import("../components/settings/date-picker"), {
	ssr: false
})

export default function Settings() {
	const theme = useTheme()
	const containerRef = useRef(null)
	const almanacFile = useAlmanacFile()

	const { size } = useResizeObserver(containerRef)

	return (
		<Box
			ref={containerRef}
			display="flex"
			alignItems={'center'}
			justifyContent="center"
			width="100%"
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
					{almanacFile.content !== null ? (
						<>
							<LatitudePicker />
							<LongitudePicker />
							<HeightPicker />
							<ElevationPicker />
							<DatePicker />
						</>
					) : (
						<UploadZone />
					)}
				</CardContent>
			</Card>
		</Box>
	)
} 
