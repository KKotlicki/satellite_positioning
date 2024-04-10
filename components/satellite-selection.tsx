import useStore from "@/store/store";
import { Box, Typography } from "@mui/material";
import Paper from '@mui/material/Paper';
import { styled } from "@mui/material/styles";
import { useRef } from "react";
import { useZustand } from "use-zustand";


const GNSSPaper = styled(Paper)(({ theme }) => ({
	flex: '1 0 30%',
	margin: theme.spacing(1),
	padding: theme.spacing(2),
	...theme.typography.body2,
	textAlign: 'left',
	maxWidth: '30%',
}));

function getSatelliteData(provider: number, almanac: Map<number, number[]>) {
	const satelliteData: Map<number, number> = new Map();
	let satelliteIdRange: [number, number]
	switch (provider) {
		case 0:
			satelliteIdRange = [1, 37];
			break;
		case 1:
			satelliteIdRange = [38, 64];
			break;
		case 2:
			satelliteIdRange = [201, 263];
			break;
		case 3:
			satelliteIdRange = [264, 283];
			break;
		case 4:
			satelliteIdRange = [111, 118];
			break;
		default:
			throw new Error("Invalid provider");
	}
	for (let i = satelliteIdRange[0]; i <= satelliteIdRange[1]; i++) {
		if (almanac.get(i) === undefined) continue
		const currentSatellite = almanac.get(i)
		if (currentSatellite === undefined) continue
		if (currentSatellite[0] === undefined) continue
		satelliteData.set(i, currentSatellite[0])
	}

	return satelliteData
}


export default function SatelliteSelection({ provider }: { provider: number }) {
	const containerRef = useRef(null)
	const almanac = useZustand(useStore, (state) => state.almanac)
	const almanacName = useZustand(useStore, (state) => state.almanacName)
	const selectedSatellites = useZustand(useStore, (state) => state.selectedSatellites)
	const changeSelectedSatellites = useZustand(useStore, (state) => state.changeSelectedSatellites);

	const handleCheckboxChange = (satelliteId: number) => {
		const selectedSatellitesSet = new Set(selectedSatellites);
		if (selectedSatellitesSet.has(satelliteId)) {
			selectedSatellitesSet.delete(satelliteId);
		} else {
			selectedSatellitesSet.add(satelliteId);
		}
		changeSelectedSatellites(Array.from(selectedSatellitesSet));
	};

	return (
		<Box
			ref={containerRef}
			display="flex"
			justifyContent="center"
			flexWrap="wrap"
			width="100%"
			height="100%"
			alignItems={selectedSatellites.length === 0 ? "center" : "flex-start"}
		>
			{!almanacName ? (
				<Paper variant="outlined"
					sx={{
						flex: '1 0 30%',
						textAlign: 'center',
						maxWidth: '30%',
						backgroundColor: '#282a36',
						cursor: 'pointer',
						'&:hover': {
							cursor: 'pointer',
						},
					}}
					onClick={() => { window.location.href = "/settings"; }}
				>
					<Typography variant="body1" component="span" style={{ color: '#bd93f9' }}>
						No Almanac
					</Typography>
				</Paper>
			) : (
				Array.from(getSatelliteData(provider, almanac)).map(([index, value]) => {
					const isHealthy = value === 0;
					return (
						<GNSSPaper key={index} variant="outlined">
							<input
								type="checkbox"
								checked={new Set(selectedSatellites).has(index)}
								onChange={() => handleCheckboxChange(index)}
							/>
							{index}
							<Paper
								elevation={0}
								style={{
									display: 'inline-block',
									backgroundColor: isHealthy ? 'green' : 'red',
									color: 'white',
									borderRadius: '20px',
									padding: '2px 10px',
									marginLeft: '10px',
									verticalAlign: 'middle',
								}}
							>
								{isHealthy ? 'Healthy' : 'Unhealthy'}
							</Paper>
						</GNSSPaper>
					);
				})
			)}
		</Box>
	)
}
