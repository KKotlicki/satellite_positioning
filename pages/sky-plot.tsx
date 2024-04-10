import dynamic from "next/dynamic"


const SkyPlotGraph = dynamic(() => import("../components/sky-plot-graph"), { ssr: false })

export default function SkyPlot() { return <SkyPlotGraph /> }
