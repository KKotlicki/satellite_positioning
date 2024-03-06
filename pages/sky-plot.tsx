import dynamic from "next/dynamic"

const SkyPlotGraph = dynamic(() => import("../components/sky-plot-graph"), {
	ssr: false
})

const SkyPlot = () => {
	return <SkyPlotGraph />
}

export default SkyPlot
