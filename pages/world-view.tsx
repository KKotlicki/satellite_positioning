
import dynamic from "next/dynamic"
const MapComponent = dynamic(() => import("../components/map"), { ssr: false })

export default function WorldView() {

	return (
		<MapComponent />
	)
}
