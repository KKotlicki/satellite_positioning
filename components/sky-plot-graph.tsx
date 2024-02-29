import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '@mui/material/styles';

const SkyPlotGraph = () => {
  const theme = useTheme();
  const containerRef = useRef(null);
  const [size, setSize] = useState(0);
  const [margin, setMargin] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const navbar = document.querySelector('.MuiAppBar-root') as HTMLElement;
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const availableHeight = window.innerHeight - navbarHeight;
      const drawer = document.querySelector('.MuiDrawer-root') as HTMLElement;
      const drawerWidth = drawer ? drawer.offsetWidth : 0;
      const availableWidth = window.innerWidth - drawerWidth;
      
      // Adjust this to change the proportion of the space used by the graph
      const targetSize = Math.min(availableWidth, availableHeight) * 0.8; // 80% of component size
      const targetMargin = Math.min(availableWidth, availableHeight) * 0.1; // 10% of component size
      
      if (containerRef.current) {
        setSize(targetSize);
        setMargin(targetMargin);
      }
    };

    // Call handleResize initially and on every resize event
    handleResize();
    window.addEventListener('resize', handleResize);

    // Setup a ResizeObserver for the container to handle other resize scenarios
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
  }, []); // Removed dependency on `containerRef` to prevent re-initializing the effect unnecessarily

  return (
    <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%' }}>
      <Plot
        data={[
          {
            r: [1, 2, 3], // radial coordinates
            theta: [45, 90, 180], // angular coordinates
            mode: 'markers',
            type: 'scatterpolar',
            marker: { color: theme.palette.primary.main },
          },
        ]}
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
