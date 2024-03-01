import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
// import Data from "react-plotly.js";
import { useTheme } from '@mui/material/styles';
import useStore from "@/store/store";

// function typeSafeKeys<T extends object>(obj: T): Array<keyof T> {
//   return Object.keys(obj) as Array<keyof T>;
// }

function generateData(sky: Map<number, Map<number, [number, number]>>, time: number): Array<any> {
  const data: Array<any> = [];
  const satelliteNumber: number = 39; // the satellite to debug

  const satelliteMap = sky.get(satelliteNumber);
  if (!satelliteMap) return data; // if satellite 39 doesn't exist, return empty data

  // Draw a point for the current time if it exists
  if (satelliteMap.has(time)) {
    const [elevation, azimuth] = satelliteMap.get(time) as [number, number];
    data.push({
      type: 'scatterpolar',
      r: [elevation],
      theta: [azimuth],
      mode: 'markers',
      marker: { size: 8 },
    });
  }

  const path: Array<[number, number]> = []; // to store the satellite path
  const separatePath: Array<[number, number]> = []; // to store the continuous line segments

  satelliteMap.forEach((value: [number, number], timeIncrement: number) => {
    // debugger;
    const [elevation, azimuth] = value;
    path.push([elevation, azimuth]);
    if (satelliteMap.get(timeIncrement + 1)) {
      separatePath.push([elevation, azimuth]);
    }
    else if (separatePath.length > 0) {
      separatePath.push([elevation, azimuth]);
      data.push({
        type: 'scatterpolar',
        r: separatePath.map(point => point[0]),
        theta: separatePath.map(point => point[1]),
        mode: 'lines',
      });
      separatePath.length = 0;
    }
  });

  // const separatePath = [];
  // // iterate over keys (not key index) and values
  // for (const [key, value] of satelliteMap) {
  //   separatePath.push([value[0], value[1]]);
  // }

  // if (path.length > 0) {
  //   data.push({
  //     type: 'scatterpolar',
  //     r: path.map(point => point[0]),
  //     theta: path.map(point => point[1]),
  //     mode: 'lines',
  //   });
  // }

  return data;
}



const SkyPlotGraph = () => {
  const theme = useTheme();
  const containerRef = useRef(null);
  const [size, setSize] = useState(0);
  const [margin, setMargin] = useState(0);
  // const elevationCutoff = useStore((state) => state.elevationCutoff)
  const sky = useStore((state) => state.sky);
  const time = useStore((state) => state.time);
  

  useEffect(() => {
    const handleResize = () => {
      const navbar = document.querySelector('.MuiAppBar-root') as HTMLElement;
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const availableHeight = window.innerHeight - navbarHeight;
      const drawer = document.querySelector('.MuiDrawer-root') as HTMLElement;
      const drawerWidth = drawer ? drawer.offsetWidth : 0;
      const availableWidth = window.innerWidth - drawerWidth;

      const targetSize = Math.min(availableWidth, availableHeight) * 0.8;
      const targetMargin = Math.min(availableWidth, availableHeight) * 0.1;

      if (containerRef.current) {
        setSize(targetSize);
        setMargin(targetMargin);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [time]);
  return (
    <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%' }}>
      <Plot
        data={generateData(sky, time)}

        layout={{
          width: size,
          height: size,
          font: {
            family: 'Roboto, sans-serif',
            color: theme.palette.text.primary,
          },
          paper_bgcolor: theme.palette.background.paper,
          polar: {
            bgcolor: theme.palette.divider,
            radialaxis: {
              visible: true,
              range: [90, 0],
              linecolor: theme.palette.text.primary,
              gridcolor: theme.palette.text.secondary,
              tickvals: [30, 60],
              showticklabels: false,
            },
            angularaxis: {
              linecolor: theme.palette.text.primary,
              gridcolor: theme.palette.text.secondary,
              rotation: 90,
              direction: "clockwise"
            },
          },
          margin: {
            l: margin,
            r: margin,
            b: margin,
            t: margin,
          },
          showlegend: false,
        }}
        config={{
          displayModeBar: false,
          staticPlot: true,
        }}
        useResizeHandler={true}
      />
    </div>
  );
};

export default SkyPlotGraph;
