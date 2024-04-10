import { mapLayerAttribution, mapLayerLink } from "@/constants/constants";
import type { SatellitePathGeocentric } from "@/constants/types";
import useStore from "@/store/store";
import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import { useZustand } from "use-zustand";
import { satelliteIDToName } from '../services/astronomy';


function generateColorPalette(numColors: number, cycles = 7): string[] {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = (360 * i * cycles
      / numColors) % 360;
    colors.push(`hsl(${hue}, 100%, 50%)`);
  }
  return colors;
}

function isSideSwitch(
  currentPoint: [number, number],
  nextPoint: [number, number],
  lonThreshold = 180,
  latThreshold = 90
): boolean {
  const currentLon = currentPoint[1];
  const nextLon = nextPoint[1];
  const currentLat = currentPoint[0];
  const nextLat = nextPoint[0];

  const lonDifference = Math.abs(currentLon - nextLon);
  const latDifference = Math.abs(currentLat - nextLat);
  return lonDifference > lonThreshold || latDifference > latThreshold;
}

function generateData(
  GNSSGeocentric: SatellitePathGeocentric,
  time: number,
  selectedSatellites: Set<number>
): Array<JSX.Element> {
  const data: Array<JSX.Element> = []

  const colors = generateColorPalette(155);

  for (const satelliteNumber of Array.from(selectedSatellites)) {
    const satelliteMap = GNSSGeocentric.get(satelliteNumber)
    if (!satelliteMap) continue;
    if (satelliteMap.length < 145) continue;

    const colorIndex = (satelliteNumber - 1) % colors.length;
    const color = colors[colorIndex] || "white";

    const satelliteData = satelliteMap[time];
    if (!satelliteData) continue;

    const [latitude, longitude] = satelliteData;

    data.push(
      <CircleMarker
        key={satelliteNumber}
        center={[latitude, longitude]}
        pathOptions={{ fillColor: color, color: color, fillOpacity: 1 }}
        radius={5}
      >
        <Tooltip direction="top" permanent>
          {satelliteIDToName(satelliteNumber)}
        </Tooltip>
      </CircleMarker>
    );

    const separatePath: Array<[number, number]> = []

    for (let i = 0; i < 144; i++) {
      const previousPoint = satelliteMap[i - 1];
      const currentPoint = satelliteMap[i];
      const nextPoint = satelliteMap[i + 1];

      if (!currentPoint || !nextPoint) continue;

      if (!currentPoint[0] || !currentPoint[1] || !nextPoint[0] || !nextPoint[1]) continue;
      if (separatePath.length === 0 && previousPoint) {
        if (isSideSwitch(previousPoint, currentPoint)) {
          if (previousPoint[1] < 0) separatePath.push([previousPoint[0], previousPoint[1] + 360]);
          else separatePath.push([previousPoint[0], previousPoint[1] - 360]);
          separatePath.push(currentPoint);
        }
      }
      if (isSideSwitch(currentPoint, nextPoint)) {
        separatePath.push(currentPoint);
        // debugger;
        if (nextPoint[1] < 0) separatePath.push([nextPoint[0], nextPoint[1] + 360]);
        else separatePath.push([nextPoint[0], nextPoint[1] - 360]);
        data.push(
          <Polyline
            key={`${satelliteNumber}-path-${i}`}
            pathOptions={{ color: color }}
            positions={[...separatePath]}
          />
        );
        separatePath.length = 0;
      } else {
        separatePath.push(currentPoint);
      }
    }
    const lastPoint = satelliteMap[144];
    if (!lastPoint) continue;
    const preLastPoint = satelliteMap[143];
    if (!preLastPoint) continue;
    if (separatePath.length > 0) {
      if (isSideSwitch(preLastPoint, lastPoint)) {
        if (lastPoint[1] < 0) separatePath.push([lastPoint[0], lastPoint[1] + 360]);
        else separatePath.push([lastPoint[0], lastPoint[1] - 360]);
      }
      else separatePath.push(lastPoint);
      data.push(
        <Polyline
          key={`${satelliteNumber}-path-last`}
          pathOptions={{ color: color }}
          positions={[...separatePath]}
        />
      );
    }
  }
  return data
}


export default function MapComponent() {
  const GNSSGeocentric = useZustand(useStore, (state) => state.GNSSGeocentric)
  const selectedSatellites = useZustand(useStore, (state) => state.selectedSatellites)
  const lat = useZustand(useStore, (state) => state.latitude)
  const lon = useZustand(useStore, (state) => state.longitude)
  const time = useZustand(useStore, (state) => state.time)

  const polylineElements = generateData(GNSSGeocentric, time, selectedSatellites);

  return (
    <MapContainer
      center={[0, 0]}
      zoom={2.5}
      minZoom={2.5}
      style={{ height: '100%', width: '100%', backgroundColor: '#121212' }}
      maxBounds={[
        [-90, -180],
        [90, 180]
      ]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url={mapLayerLink}
        attribution={mapLayerAttribution}
      />
      {polylineElements}
      <CircleMarker center={[lat, lon]} pathOptions={{ fillColor: 'red', color: 'red' }} radius={5}>
        <Tooltip direction="top">
          Your Location
        </Tooltip>
      </CircleMarker>

    </MapContainer>
  );
};
