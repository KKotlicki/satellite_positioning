import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '@mui/material/styles';
import useStore from "@/store/store";
import { green } from '@mui/material/colors';

function typeSafeKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}


const SkyPlotGraph = () => {
  const theme = useTheme();
  const containerRef = useRef(null);
  const [size, setSize] = useState(0);
  const [margin, setMargin] = useState(0);
  const GPS = useStore((state) => state.GPS);
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
        data={typeSafeKeys(GPS).flatMap((key) => {
          const gpsArray = GPS[key];
          if (!gpsArray) throw new Error();

          const pathTrace = {
            r: gpsArray.map((coord: [number, number]) => Math.sqrt(coord[0] ** 2 + coord[1] ** 2)),
            theta: gpsArray.map((coord: [number, number]) => Math.atan2(coord[1], coord[0]) * (180 / Math.PI)),
            mode: 'lines',
            type: 'scatterpolar',
            marker: { color: theme.palette.primary.main },
          } as const;

          const currentIndex = time % gpsArray.length;
          const currentPosition = gpsArray[currentIndex];

          if (!currentPosition) throw new Error();

          const satelliteID = `G${String(key).padStart(2, '0')}`;
          const currentTrace = {
            r: [Math.sqrt(currentPosition[0] ** 2 + currentPosition[1] ** 2)],
            theta: [Math.atan2(currentPosition[1], currentPosition[0]) * (180 / Math.PI)],
            mode: 'text+markers' as const,
            type: 'scatterpolar' as const,
            text: [satelliteID],
            textposition: 'top right' as const,
            marker: {
              color: green[800],
              size: 10,
            },
            textfont: {
              color: green[800],
              size: 12,
            },
          };

          return [pathTrace, currentTrace];
        })}
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
              range: [0, 360],
              linecolor: theme.palette.text.primary,
              gridcolor: theme.palette.text.secondary,
              tickvals: [120, 240],
              showticklabels: false,
            },
            angularaxis: {
              linecolor: theme.palette.text.primary,
              gridcolor: theme.palette.text.secondary,
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
