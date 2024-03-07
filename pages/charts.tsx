import dynamic from "next/dynamic"

const ElevationGraph = dynamic(() => import("../components/elevation-graph"), {
	ssr: false
})

const Charts = () => {
	return <ElevationGraph />
}

export default Charts
