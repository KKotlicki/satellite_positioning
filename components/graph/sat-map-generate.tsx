import type { SatellitePathGeocentric, SelectedSatellites } from "@/global/types";
import 'leaflet/dist/leaflet.css';
import { CircleMarker, Polyline, Tooltip } from 'react-leaflet';


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

export default function generateData(
  GNSSGeocentric: SatellitePathGeocentric,
  time: number,
  selectedSatellites: SelectedSatellites,
  selectedTocs: number[]
): Array<JSX.Element> {
  const data: Array<JSX.Element> = [];

  const colors = generateColorPalette(155);
  let colorIndex = 0;

  for (const [_, sats] of Object.entries(selectedSatellites)) {
    for (const [prn, satData] of Object.entries(sats)) {
      if (!satData.isSelected) continue;

      const satelliteData = GNSSGeocentric[prn];
      if (!satelliteData) continue;

      const color = colors[colorIndex % colors.length];
      colorIndex++;

      const selectedToc = selectedTocs[time];
      if (!selectedToc) continue;
      const currentDataPoint = satelliteData[selectedToc];
      if (!currentDataPoint) continue;

      const { latitude, longitude } = currentDataPoint;

      data.push(
        <CircleMarker
          key={prn}
          center={[latitude, longitude]}
          pathOptions={{ fillColor: color, color: color, fillOpacity: 1 }}
          radius={5}
        >
          <Tooltip direction="top" permanent>
            {prn}
          </Tooltip>
        </CircleMarker>
      );

      const separatePath: Array<[number, number]> = [];

      for (let i = 0; i < selectedTocs.length - 1; i++) {
        const previousToc = selectedTocs[i - 1];
        const currentToc = selectedTocs[i];
        const nextToc = selectedTocs[i + 1];
        if (!previousToc || !currentToc || !nextToc) continue;
        const previousPoint = satelliteData[previousToc];
        const currentPoint = satelliteData[currentToc];
        const nextPoint = satelliteData[nextToc];

        if (!currentPoint || !nextPoint) continue;

        if (separatePath.length === 0 && previousPoint) {
          if (isSideSwitch([previousPoint.latitude, previousPoint.longitude], [currentPoint.latitude, currentPoint.longitude])) {
            if (previousPoint.longitude < 0) separatePath.push([previousPoint.latitude, previousPoint.longitude + 360]);
            else separatePath.push([previousPoint.latitude, previousPoint.longitude - 360]);
            separatePath.push([currentPoint.latitude, currentPoint.longitude]);
          }
        }
        if (isSideSwitch([currentPoint.latitude, currentPoint.longitude], [nextPoint.latitude, nextPoint.longitude])) {
          separatePath.push([currentPoint.latitude, currentPoint.longitude]);
          if (nextPoint.longitude < 0) separatePath.push([nextPoint.latitude, nextPoint.longitude + 360]);
          else separatePath.push([nextPoint.latitude, nextPoint.longitude - 360]);
          data.push(
            <Polyline
              key={`${prn}-path-${i}`}
              pathOptions={{ color: color }}
              positions={[...separatePath]}
            />
          );
          separatePath.length = 0;
        } else {
          separatePath.push([currentPoint.latitude, currentPoint.longitude]);
        }
      }
      const lastToc = selectedTocs[selectedTocs.length - 1];
      const preLastToc = selectedTocs[selectedTocs.length - 2];
      if (!lastToc || !preLastToc) continue;
      const lastPoint = satelliteData[lastToc];
      if (!lastPoint) continue;
      const preLastPoint = satelliteData[preLastToc];
      if (!preLastPoint) continue;
      if (separatePath.length > 0) {
        if (isSideSwitch([preLastPoint.latitude, preLastPoint.longitude], [lastPoint.latitude, lastPoint.longitude])) {
          if (lastPoint.longitude < 0) separatePath.push([lastPoint.latitude, lastPoint.longitude + 360]);
          else separatePath.push([lastPoint.latitude, lastPoint.longitude - 360]);
        } else {
          separatePath.push([lastPoint.latitude, lastPoint.longitude]);
        }
        data.push(
          <Polyline
            key={`${prn}-path-last`}
            pathOptions={{ color: color }}
            positions={[...separatePath]}
          />
        );
      }
    }
  }
  return data;
}