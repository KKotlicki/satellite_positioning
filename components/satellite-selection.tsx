import { theme } from "@/global/constants"
import type { Almanac, RinexNavigation } from "@/global/types"
import {
	useActions,
	useNavigationFile,
	useSelectedSatellites,
	useSelectedTocs
} from "@/services/store"
import { Box, Typography } from "@mui/material"
import Paper from "@mui/material/Paper"
import { styled } from "@mui/material/styles"

const GNSSPaper = styled(Paper)(({ theme }) => ({
	flex: "1 0 30%",
	margin: theme.spacing(1),
	padding: theme.spacing(2),
	...theme.typography.body2,
	textAlign: "center",
	maxWidth: "30%"
}))

function getSatelliteData(
	provider: string,
	navigationFile: Almanac | RinexNavigation | undefined,
	selectedTocs: number[]
): Map<string, number> {
	const satelliteData: Map<string, number> = new Map()

	const checkHealthStatus = (satellite: {
		[toc: number]: { health: number }
	}): { health: number } => {
		const tocs = Object.entries(satellite).map(([toc, data]) => ({
			toc: Number(toc),
			health: data.health
		}))

		if (tocs.length === 0) return { health: 1 }

		const firstToc = selectedTocs[0]
		const lastToc = selectedTocs[selectedTocs.length - 1]
		if (firstToc === undefined || lastToc === undefined) return { health: 1 }

		const allHealthyInRange = selectedTocs.every((toc) => {
			const health = satellite[toc]?.health
			return health === 0
		})

		if (allHealthyInRange) return { health: 0 }

		const closestToStart = tocs.reduce((prev, curr) => {
			return Math.abs(curr.toc - firstToc) < Math.abs(prev.toc - firstToc)
				? curr
				: prev
		})

		const closestToEnd = tocs.reduce((prev, curr) => {
			return Math.abs(curr.toc - lastToc) < Math.abs(prev.toc - lastToc)
				? curr
				: prev
		})

		return closestToStart.health === 0 || closestToEnd.health === 0
			? { health: 0 }
			: { health: 1 }
	}

	const allSatellites = new Set([...Object.keys(navigationFile || {})])

	for (const prn of Array.from(allSatellites)) {
		if (prn.charAt(0) === provider) {
			const currentSatellite = navigationFile?.[prn]
			if (currentSatellite) {
				const healthStatus = checkHealthStatus(currentSatellite)
				satelliteData.set(prn, healthStatus.health)
			}
		}
	}

	return satelliteData
}

export default function SatelliteSelection({ provider }: { provider: string }) {
	const navigationFile = useNavigationFile()
	const selectedSatellites = useSelectedSatellites()
	const selectedTocs = useSelectedTocs()
	const { changeSelectedSatellites } = useActions()

	const handleCheckboxChange = (
		provider: string,
		prn: string,
		health: number
	) => {
		const newSelectedSatellites = { ...selectedSatellites }

		if (!newSelectedSatellites[provider]) {
			newSelectedSatellites[provider] = {}
		}

		if (newSelectedSatellites[provider][prn]?.isSelected) {
			delete newSelectedSatellites[provider][prn]
		} else {
			newSelectedSatellites[provider][prn] = {
				isSelected: true,
				health
			}
		}

		changeSelectedSatellites(newSelectedSatellites)
	}

	if (navigationFile === null) {
		return <></>
	}
	const satelliteData = getSatelliteData(
		provider,
		navigationFile.content,
		selectedTocs
	)

	const countSelectedSatellites = Object.values(selectedSatellites).reduce(
		(acc, providerSatellites) => {
			return (
				acc +
				Object.values(providerSatellites).filter((sat) => sat.isSelected).length
			)
		},
		0
	)

	return (
		<Box
			display='flex'
			justifyContent='center'
			alignItems='center'
			flexDirection='column'
		>
			<Box display='flex' flexWrap='wrap' justifyContent='flex-start'>
				{Array.from(satelliteData).map(([prn, health]) => {
					const isHealthy = health === 0
					return (
						<GNSSPaper
							key={prn}
							variant='outlined'
							onClick={() => handleCheckboxChange(provider, prn, health)}
							style={{
								backgroundColor: selectedSatellites[provider]?.[prn]?.isSelected
									? theme.palette.divider
									: theme.palette.background.default
							}}
						>
							<Typography variant='body1' component='span'>
								{prn}
							</Typography>
							<Paper
								elevation={0}
								style={{
									display: "inline-block",
									backgroundColor: isHealthy ? "green" : "red",
									color: "white",
									borderRadius: "20px",
									padding: "2px 10px",
									marginLeft: "10px",
									verticalAlign: "middle"
								}}
							>
								{isHealthy ? "Healthy" : "Unhealthy"}
							</Paper>
						</GNSSPaper>
					)
				})}
			</Box>
			<Typography
				variant='body1'
				color='textSecondary'
				sx={{ width: "100%", textAlign: "center", marginTop: "1rem" }}
			>
				{countSelectedSatellites} selected
			</Typography>
		</Box>
	)
}
