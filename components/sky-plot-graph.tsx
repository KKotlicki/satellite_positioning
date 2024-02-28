import React from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '@mui/material/styles';

const SkyPlotGraph = () => {
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%' }}>
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
          autosize: true,
          font: {
            family: 'Roboto, sans-serif',
            color: theme.palette.text.primary,
          },
          paper_bgcolor: theme.palette.background.paper,
          polar: {
            bgcolor: theme.palette.divider, // Use the same color as the CardHeader
            radialaxis: {
              visible: true,
              range: [0, 360],
              linecolor: theme.palette.text.primary,
              gridcolor: theme.palette.text.secondary,
              tickvals: [120, 240], // Set radial dividers at 120 and 240
            },
            angularaxis: {
              linecolor: theme.palette.text.primary,
              gridcolor: theme.palette.text.secondary,
            },
          },
        }}
        config={{ 
          displayModeBar: false, // Hide the toolbar
          staticPlot: true, // Make the plot non-interactive
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default SkyPlotGraph;