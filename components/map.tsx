import useStore from "@/store/store";
import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import { useZustand } from "use-zustand";


function generateColorPalette(numColors: number, cycles = 7): string[] {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = (360 * i * cycles / numColors) % 360;
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
  GNSSGeocentric: Map<number, [number, number][]>,
  time: number,
  selectedSatellites: number[]
): Array<JSX.Element> {
  const data: Array<JSX.Element> = []

  const colors = generateColorPalette(155);

  for (const satelliteNumber of selectedSatellites) {
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
          {satelliteNumber}
        </Tooltip>
      </CircleMarker>
    );

    const separatePath: Array<[number, number]> = []

    for (let i = 0; i < 144; i++) {
      const currentPoint = satelliteMap[i];
      const nextPoint = satelliteMap[i + 1];

      if (!currentPoint || !nextPoint) continue;

      if (!currentPoint[0] || !currentPoint[1] || !nextPoint[0] || !nextPoint[1]) continue;

      if (isSideSwitch(currentPoint, nextPoint)) {
        separatePath.push(currentPoint);
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
    if (separatePath.length > 0) {
      separatePath.push(lastPoint);
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

const MapComponent = () => {
  const GNSSGeocentric = useZustand(useStore, (state) => state.GNSSGeocentric)
  const selectedSatellites = useZustand(useStore, (state) => state.selectedSatellites)
  const time = useZustand(useStore, (state) => state.time)

  const polylineElements = generateData(GNSSGeocentric, time, selectedSatellites);

  return (
    <MapContainer center={[0, 0]} zoom={2.5} style={{ height: '100vh', width: '100%', backgroundColor: '#121212' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {polylineElements}

    </MapContainer>
  );
};

export default MapComponent
