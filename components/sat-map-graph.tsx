import { mapLayerAttribution, mapLayerLink } from "@/global/constants"
import {
	useGNSSGeocentric,
	useLatitude,
	useLongitude,
	useSelectedSatellites,
	useSelectedTocs,
	useTime
} from "@/services/store"
import "leaflet/dist/leaflet.css"
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet"
import generateSatMapData from "./graph/sat-map-generate"

export default function MapComponent() {
	const GNSSGeocentric = useGNSSGeocentric()
	const selectedSatellites = useSelectedSatellites()
	const lat = useLatitude()
	const lon = useLongitude()
	const time = useTime()
	const selectedTocs = useSelectedTocs()

	const polylineElements = generateSatMapData(
		GNSSGeocentric,
		time,
		selectedSatellites,
		selectedTocs
	)

	return (
		<MapContainer
			center={[0, 0]}
			zoom={2.5}
			minZoom={2.5}
			style={{ height: "100%", width: "100%", backgroundColor: "#121212" }}
			maxBounds={[
				[-90, -180],
				[90, 180]
			]}
			maxBoundsViscosity={1.0}
		>
			<TileLayer url={mapLayerLink} attribution={mapLayerAttribution} />
			{polylineElements}
			<CircleMarker
				center={[lat, lon]}
				pathOptions={{ fillColor: "red", color: "red" }}
				radius={5}
			>
				<Tooltip direction='top'>Your Location</Tooltip>
			</CircleMarker>
		</MapContainer>
	)
}
