import dayjs, { Dayjs } from 'dayjs'
import { create } from 'zustand'

type SatellitePath = Record<number, [number, number][]>

// const GPS = {
//     1: [[0, 0], [0, 0], [0, 0], [0, 0]],
// } as const satisfies SatellitePath
type Store = {
    latitude: string,
    changeLatitude: (newLatitude: string) => void
    longitude: string,
    changeLongitude: (newLongitude: string) => void
    height: number,
    changeHeight: (newHeight: number) => void
    elevationCutoff: number,
    changeElevationCutoff: (newElevationCutoff: number) => void
    date: Dayjs,
    changeDate: (newDate: Dayjs) => void
    time: number,
    changeTime: (newTime: number) => void
    almanacName: string,
    changeAlmanacName: (newAlmanacName: string) => void
    GPS: SatellitePath,
    changeGPS: (newGPS: SatellitePath) => void
}

const useStore = create<Store>((set) => ({
    latitude: "N 0° 0' 0",
    changeLatitude: (newLatitude) => set(() => ({ latitude: newLatitude })),
    longitude: "E 0° 0' 0",
    changeLongitude: (newLongitude) => set(() => ({ longitude: newLongitude })),
    height: 480,
    changeHeight: (newHeight) => set(() => ({ height: newHeight })),
    elevationCutoff: 7,
    changeElevationCutoff: (newElevationCutoff) => set(() => ({ elevationCutoff: newElevationCutoff })),
    date: dayjs(new Date()).startOf('day'),
    changeDate: (newDate) => set(() => ({ date: newDate.startOf('day') })),
    time: 72,
    changeTime: (newTime) => set(() => ({ time: newTime })),
    almanacName: "",
    changeAlmanacName: (newAlmanacName) => set(() => ({ almanacName: newAlmanacName })),
    GPS: {
        2: Array.from({ length: 144 }, (_, index) => {
            const angle = (index / 144) * 2 * Math.PI;
            const latitude = Math.sin(angle) * 100;
            const longitude = Math.cos(angle) * 100;
            return [latitude, longitude];
        }),
        3: Array.from({ length: 144 }, (_, index) => {
            const angle = (index / 144) * 2 * Math.PI;
            const latitude = Math.sin(angle) * 200;
            const longitude = Math.cos(angle) * 200;
            return [latitude, longitude];
        }),
        4: Array.from({ length: 144 }, (_, index) => {
            const angle = (index / 144) * 2 * Math.PI;
            const latitude = Math.sin(angle) * 300;
            const longitude = Math.cos(angle) * 300;
            return [latitude, longitude];
        }),
    },
    changeGPS: (newGPS) => set(() => ({ GPS: newGPS })),
}));

export default useStore;
