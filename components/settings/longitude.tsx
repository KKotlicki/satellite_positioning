import useStore from "@/store/store";
import {
	InputAdornment,
	TextField
} from "@mui/material";
import { ChangeEvent, useState } from "react";
import { useZustand } from "use-zustand";


const LongitudePicker = () => {
	const [longitudeValue, setLongitudeValue] = useState("E 0° 0' 0.0")

	const changeLongitude = useZustand(useStore, (state) => state.changeLongitude)

	const isValidLongitude = (value: string) => {
		const sanitizedValue = value.replace(/\s+/g, "")

		if (
			/^[-EeWw]?\d{1,3}°\d{1,2}'\d{1,2}(\.\d+)?$|^[-EeWw]?\d{1,3}(\.\d+)?$/.test(
				sanitizedValue
			)
		) {
			if (sanitizedValue.includes("°")) {
				const parts = sanitizedValue.match(
					/([-EeWw]?)(\d{1,3})°(\d{1,2})'(\d{1,2}(\.\d+)?)/
				)
				if (parts) {
					const third = parts[2]
					const fourth = parts[3]
					const fifth = parts[4]

					if (third === undefined || fourth === undefined || fifth === undefined) return false

					const degrees = parseFloat(third)
					const minutes = parseFloat(fourth) / 60
					const seconds = parseFloat(fifth) / 3600
					const totalDegrees = degrees + minutes + seconds
					return totalDegrees <= 180 && totalDegrees >= -180
				}
			} else {
				const parts = sanitizedValue.match(/([-EeWw]?)(\d{1,3}(\.\d+)?)/)
				if (parts) {
					const second = parts[1]
					const third = parts[2]

					if (second === undefined || third === undefined) return false

					const value = parseFloat(third)
					const sign = /^-|W|w/.test(second) ? -1 : 1
					const totalDegrees = sign * value
					return totalDegrees <= 180 && totalDegrees >= -180
				}
			}
		}
		return false
	}

	const parseLongitude = (value: string) => {
		const sanitizedValue = value.replace(/\s+/g, "")

		if (
			/^[-EeWw]?\d{1,3}°\d{1,2}'\d{1,2}(\.\d+)?$|^[-EeWw]?\d{1,3}(\.\d+)?$/.test(
				sanitizedValue
			)
		) {
			if (sanitizedValue.includes("°")) {
				const parts = sanitizedValue.match(
					/([-EeWw]?)(\d{1,3})°(\d{1,2})'(\d{1,2}(\.\d+)?)?/
				)
				if (parts) {
					const second = parts[1]
					const third = parts[2]
					if (second === undefined || third === undefined) return NaN
					const degrees = parseFloat(third)
					const minutes = parts[3] ? parseFloat(parts[3]) / 60 : 0
					const seconds = parts[4] ? parseFloat(parts[4]) / 3600 : 0
					const sign = /^-|W|w/.test(second) ? -1 : 1
					const totalDegrees = sign * (degrees + minutes + seconds)
					return Math.max(Math.min(totalDegrees, 180), -180)
				}
			} else {
				const parts = sanitizedValue.match(/([-EeWw]?)(\d{1,3}(\.\d+)?)/)
				if (parts) {
					const second = parts[1]
					const third = parts[2]
					if (second === undefined || third === undefined) return NaN
					const sign = /^-|W|w/.test(second) ? -1 : 1
					const value = parseFloat(third)
					return Math.max(Math.min(sign * value, 180), -180)
				}
			}
		}
		return NaN
	}

	const handleLongitudeChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const newValue = e.target.value
		setLongitudeValue(newValue)

		if (isValidLongitude(newValue)) {
			changeLongitude(parseLongitude(newValue))
		}
	}

	return (
		<TextField
			label='Longitude'
			value={longitudeValue}
			onChange={handleLongitudeChange}
			fullWidth
			margin='normal'
			placeholder="E 0° 0' 0.0"
			InputProps={{
				endAdornment: <InputAdornment position='end'>°</InputAdornment>
			}}
			error={!isValidLongitude(longitudeValue)}
		/>
	)
}

export default LongitudePicker
