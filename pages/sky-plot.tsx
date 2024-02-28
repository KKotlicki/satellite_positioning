import React from 'react'
import Plot from 'react-plotly.js';
import dynamic from 'next/dynamic';


const SkyPlotGraph = dynamic(() => import('../components/sky-plot-graph'), {
  ssr: false // This will prevent the component from being rendered on the server.
});

const SkyPlot = () => {
  return (
      <SkyPlotGraph />
  )
}

export default SkyPlot