import dayjs, { Dayjs } from 'dayjs'
import { create } from 'zustand'

const useStore = create<{
    latitude: string,
    changeLatitude: (newLatitude: string) => void
    longitude: string,
    changeLongitude: (newLongitude: string) => void
    height: number,
    changeHeight: (newHeight: number) => void
    elevationCutoff: number,
    changeElevationCutoff: (newElevationCutoff: number) => void
    timeAndDate: Dayjs,
    changeTimeAndDate: (newTimeAndDate: Dayjs) => void
    almanacName: string,
    changeAlmanacName: (newAlmanacName: string) => void
}>((set) => ({
    latitude: "N 0° 0' 0",
    changeLatitude: (newLatitude) => set(() => ({ latitude: newLatitude })),
    longitude: "E 0° 0' 0",
    changeLongitude: (newLongitude) => set(() => ({ longitude: newLongitude })),
    height: 480,
    changeHeight: (newHeight) => set(() => ({ height: newHeight })),
    elevationCutoff: 7,
    changeElevationCutoff: (newElevationCutoff) => set(() => ({ elevationCutoff: newElevationCutoff })),
    timeAndDate: dayjs(new Date()),
    changeTimeAndDate: (newTimeAndDate) => set(() => ({ timeAndDate: newTimeAndDate })),
    almanacName: "",
    changeAlmanacName: (newAlmanacName) => set(() => ({ almanacName: newAlmanacName })),
}))

export default useStore 