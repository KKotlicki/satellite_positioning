import { theme } from "@/global/constants"
import {
	useElevationCutoff,
	useHeight,
	useLatitude,
	useLongitude,
	useNavigationFile,
	useObservationFile,
	useSelectedTocs
} from "@/services/store"
import { useMeteoFile } from "@/stores/meteo-store"
import { Card, CardContent, CardHeader, Paper } from "@mui/material"
import Box from "@mui/material/Box"
import { styled } from "@mui/material/styles"
import dayjs from "dayjs"
import UploadZone from "./settings/upload_zone"

const FileUploadedPaper = styled(Paper, {
	shouldForwardProp: (prop) => prop !== "color"
})(({ theme, color }) => ({
	flex: "1 0 auto",
	margin: theme.spacing(1),
	padding: theme.spacing(2),
	...theme.typography.body2,
	textAlign: "center",
	maxWidth: "100%",
	backgroundColor: color,
	fontSize: "0.6rem",
	whiteSpace: "pre-line",
	overflowWrap: "break-word",
	wordWrap: "break-word"
}))

export default function SettingsView(): JSX.Element {
	const latitude = useLatitude()
	const longitude = useLongitude()
	const height = useHeight()
	const elevationCutoff = useElevationCutoff()
	const navigationFile = useNavigationFile()
	const observationFile = useObservationFile()
	const meteoFile = useMeteoFile()
	const selectedTocs = useSelectedTocs()

	const startSelectedToc = selectedTocs[0]
	const endSelectedToc = selectedTocs[selectedTocs.length - 1]
	if (startSelectedToc === undefined || endSelectedToc === undefined)
		return <></>

	const startDateTime = dayjs
		.unix(startSelectedToc + 315964800)
		.utc()
		.format("DD/MM/YYYY HH:mm:ss")
	const endDateTime = dayjs
		.unix(endSelectedToc + 315964800)
		.utc()
		.format("DD/MM/YYYY HH:mm:ss")

	function parseLatitude(latitude: number): string {
		const direction = latitude < 0 ? "S" : "N"
		const absolute = Math.abs(latitude)
		const degrees = Math.floor(absolute)
		const minutes = (absolute - degrees) * 60
		return `${degrees}° ${minutes.toFixed(2)}' ${direction}`
	}

	function parseLongitude(longitude: number): string {
		const direction = longitude < 0 ? "W" : "E"
		const absolute = Math.abs(longitude)
		const degrees = Math.floor(absolute)
		const minutes = (absolute - degrees) * 60
		return `${degrees}° ${minutes.toFixed(2)}' ${direction}`
	}

	return (
		<Card
			sx={{
				width: "full-width",
				margin: "1rem"
			}}
			variant='outlined'
		>
			<CardHeader
				title='My Settings'
				style={{
					borderBottom: `1px solid ${theme.palette.divider}`,
					backgroundColor: theme.palette.divider
				}}
			/>
			{navigationFile !== null ||
			observationFile !== null ||
			meteoFile !== null ? (
				<CardContent>
					<Box
						component='ul'
						sx={{
							m: 0,
							p: 0,
							pl: 1
						}}
					>
						<li>{parseLatitude(latitude)}</li>
						<li>{parseLongitude(longitude)}</li>
						<li>Height: {height} m</li>
						<li>Elevation cutoff: {elevationCutoff}°</li>
						<li>Observation start: {startDateTime}</li>
						<li>Observation end: {endDateTime}</li>
					</Box>
					<FileUploadedPaper color={navigationFile !== null ? "green" : "red"}>
						{navigationFile !== null
							? `Navigation file: ${navigationFile.fileName}`
							: "No navigation file uploaded"}
					</FileUploadedPaper>
					<FileUploadedPaper color={observationFile !== null ? "green" : "red"}>
						{observationFile !== null
							? `Observation file: ${observationFile.fileName}`
							: "No observation file uploaded"}
					</FileUploadedPaper>
					<FileUploadedPaper color={meteoFile !== null ? "green" : "red"}>
						{meteoFile !== null
							? `Meteo file: ${meteoFile.fileName}`
							: "No meteo file uploaded"}
					</FileUploadedPaper>
					<UploadZone />
				</CardContent>
			) : (
				<CardContent>
					<FileUploadedPaper color='red'>
						{"No Files Uploaded"}
					</FileUploadedPaper>
				</CardContent>
			)}
		</Card>
	)
}
