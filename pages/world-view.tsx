
import dynamic from "next/dynamic"


const SatMapComponent = dynamic(() => import("../components/sat-map-graph"), { ssr: false })

export default function WorldView() { return <SatMapComponent /> }
