import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import Data from "react-plotly.js";
import { useTheme } from '@mui/material/styles';
import useStore from "@/store/store";
import { green } from '@mui/material/colors';

function typeSafeKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

function generateData(sky: Map<number, Map<number, number[]>>, elevationCutoff: number): Data[] {
  const data: Data[] = [];
// for each key satelliteNumber in the sky variable
  // if satelliteNumber === 39 (for the debugging purposes)
    // get the value as satelliteMap Map<number, number[]> (timeIncrement: [elevation, azimuth])

    // if satelliteMap(time)
      // const currentPosition = satelliteMap(time)
      // create a marker object with current position of Data type
      // set the marker object to the data array

    // const currentLine = [number, number][]
    // for each timeIncrement (key) in the satelliteMap variable
      // if satelliteMap(timeIncrement+1) exists or satelliteMap(timeIncrement-1) exists !!! Keep in mind that the timeIncrement+1 and timeincrement-1 are keys of the satelliteMap, not indexes.
      // we are checking if the value of next or previous timeIncrement exists as a key in the satelliteMap
        // add satelliteMap(timeIncrement) to the currentLine
      // else if currentLine.length > 0
        // create Data object with currentLine
        // set the Data object to the data array
        // reset currentLine to empty array

  return data;
}


const SkyPlotGraph = () => {
  const theme = useTheme();
  const containerRef = useRef(null);
  const [size, setSize] = useState(0);
  const [margin, setMargin] = useState(0);
  const elevationCutoff = useStore((state) => state.elevationCutoff)
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
  // console.log("AAA", typeSafeKeys(GNSS), GNSS)
  return (
    <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%' }}>
      <Plot
        data={generateData(sky, elevationCutoff)}

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
