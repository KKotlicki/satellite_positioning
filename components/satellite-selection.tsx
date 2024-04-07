import useStore from "@/store/store";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { get } from "http";
import { e, number } from "mathjs";
import { Data } from "plotly.js";
import { useEffect, useRef, useState } from "react";
import { useZustand } from "use-zustand";
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const GNSSPaper = styled(Paper)(({ theme }) => ({
	flex: '1 0 30%', // Adjusts the basis for 3 items per row taking into account some margin
	margin: theme.spacing(1),
	padding: theme.spacing(2),
	...theme.typography.body2,
	textAlign: 'left',
	// Ensuring the items do not grow too large, adjust as per design needs
	maxWidth: '30%', // This controls the maximum width of each paper
}));

function getSatelliteData(provider: number, almanac: Map<number, number[]>) {
	// get health of satellites and selection of satellites
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


const SatelliteSelection = ({ provider }: { provider: number }) => {
	const theme = useTheme()
	const containerRef = useRef(null)
	const almanac = useZustand(useStore, (state) => state.almanac)
	const selectedSatellites = useZustand(useStore, (state) => state.selectedSatellites)
	const changeSelectedSatellites = useZustand(useStore, (state) => state.changeSelectedSatellites);

	const handleCheckboxChange = (satelliteId: number) => {
		const selectedSatellitesSet = new Set(selectedSatellites); // Convert array to Set for efficient lookup
		if (selectedSatellitesSet.has(satelliteId)) {
			selectedSatellitesSet.delete(satelliteId);
		} else {
			selectedSatellitesSet.add(satelliteId);
		}
		changeSelectedSatellites(Array.from(selectedSatellitesSet)); // Convert back to array to update state
	};

	return (
		<Box
			ref={containerRef}
			display="flex"
			justifyContent="left"
			flexWrap="wrap" // This enables wrapping
			width="100%"
			height="100%"
		>
{Array.from(getSatelliteData(provider, almanac)).map(([index, value]) => {
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
        elevation={0} // Adjust elevation for flat or raised appearance
        style={{
          display: 'inline-block', // Makes the Paper inline for flow with text
          backgroundColor: isHealthy ? 'green' : 'red',
          color: 'white',
          borderRadius: '20px', // Provides the rounded corners
          padding: '2px 10px', // Adjust padding to control the size
          marginLeft: '10px', // Adds some space between the text and the indicator
          verticalAlign: 'middle', // Aligns with the surrounding text
        }}
      >
        {isHealthy ? 'Healthy' : 'Unhealthy'}
      </Paper>
    </GNSSPaper>
  );
})}
		</Box>
	)
}

export default SatelliteSelection
