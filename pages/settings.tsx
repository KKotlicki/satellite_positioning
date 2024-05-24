import DatePeriodPicker from "@/components/settings/date-period-picker";
import ElevationPicker from "@/components/settings/elevation";
import HeightPicker from "@/components/settings/height";
import LatitudePicker from "@/components/settings/latitude";
import LongitudePicker from "@/components/settings/longitude";
import UploadZone from "@/components/settings/upload_zone";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { useNavigationFile } from "@/stores/navigation-store";
import { Box, Card, CardContent, CardHeader, useTheme } from "@mui/material";
import { useRef } from "react";


export default function Settings() {
	const theme = useTheme()
	const containerRef = useRef(null)
	const navigationFile = useNavigationFile()

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
					{navigationFile !== null ? (
						<>
							<LatitudePicker />
							<LongitudePicker />
							<HeightPicker />
							<ElevationPicker />
							<DatePeriodPicker />
						</>
					) : (
						<UploadZone />
					)}
				</CardContent>
			</Card>
		</Box>
	)
} 
