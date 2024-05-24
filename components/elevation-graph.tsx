import { generateTimeLabels } from '@/services/graphUtilites';
import { useElevationCutoff, useNavigationActions, useSelectedSatellites, useSelectedTocs, useSky, useTime } from '@/stores/navigation-store';
import { useTheme } from "@mui/material/styles";
import dayjs from 'dayjs';
import type { LegendClickEvent } from 'plotly.js';
import Plot from "react-plotly.js";
import generateElevationData from './graph/elevation-generate';


export default function ElevationGraph() {
	const theme = useTheme();
	const elevationCutoff = useElevationCutoff();
	const sky = useSky();
	const time = useTime();
	const selectedSatellites = useSelectedSatellites();
	const selectedTocs = useSelectedTocs();
	const { changeSelectedSatellites } = useNavigationActions();

	const timeLabels = generateTimeLabels(selectedTocs);
	const shortTimeLabels = selectedTocs.map(toc => dayjs.utc((toc + 315964800) * 1000).format('HH:mm'));

	const handleLegendClick = (event: Readonly<LegendClickEvent>) => {
		const clickedSatelliteName = event.data[event.curveNumber]?.name;
		if (!clickedSatelliteName) return false;
		const updatedSelectedSatellites = { ...selectedSatellites };
		for (const [_, sats] of Object.entries(updatedSelectedSatellites)) {
			if (sats[clickedSatelliteName]) {
				delete sats[clickedSatelliteName];
			}
		}
		changeSelectedSatellites(updatedSelectedSatellites);
		return false;
	};

	return (
		<Plot
			data={generateElevationData(sky, time, elevationCutoff, selectedSatellites, selectedTocs, timeLabels)}
			layout={{
				autosize: true,
				margin: {
					pad: 0,
				},
				paper_bgcolor: theme.palette.background.default,
				plot_bgcolor: theme.palette.background.default,
				xaxis: {
					title: "Time",
					showline: true,
					linecolor: theme.palette.text.primary,
					tickfont: {
						color: theme.palette.text.primary,
					},
					range: [0, 144],
					fixedrange: true,
					tickvals: Array.from({ length: 13 }, (_, i) => i * 12),
					ticktext: shortTimeLabels.filter((_, index) => index % 12 === 0),
				},
				yaxis: {
					title: "Elevation",
					showline: true,
					linecolor: theme.palette.text.primary,
					tickfont: {
						color: theme.palette.text.primary,
					},
					range: [0, 90],
					fixedrange: true,
					rangemode: "nonnegative"
				},
				showlegend: true,
				legend: {
					tracegroupgap: 0
				}
			}}
			config={{
				displayModeBar: false,
			}}
			onLegendClick={handleLegendClick}
		/>
	)
}
