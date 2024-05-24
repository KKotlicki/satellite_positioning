import { useNavigationActions } from "@/stores/navigation-store";
import { InputAdornment, TextField } from "@mui/material";
import { type ChangeEvent, useState } from "react";


export default function LongitudePicker() {
	const [longitudeValue, setLongitudeValue] = useState("E 0° 0' 0.0")

	const { changeLongitude } = useNavigationActions()

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

					const degrees = Number.parseFloat(third)
					const minutes = Number.parseFloat(fourth) / 60
					const seconds = Number.parseFloat(fifth) / 3600
					const totalDegrees = degrees + minutes + seconds
					return totalDegrees <= 180 && totalDegrees >= -180
				}
			} else {
				const parts = sanitizedValue.match(/([-EeWw]?)(\d{1,3}(\.\d+)?)/)
				if (parts) {
					const second = parts[1]
					const third = parts[2]

					if (second === undefined || third === undefined) return false

					const value = Number.parseFloat(third)
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
					if (second === undefined || third === undefined) return Number.NaN
					const degrees = Number.parseFloat(third)
					const minutes = parts[3] ? Number.parseFloat(parts[3]) / 60 : 0
					const seconds = parts[4] ? Number.parseFloat(parts[4]) / 3600 : 0
					const sign = /^-|W|w/.test(second) ? -1 : 1
					const totalDegrees = sign * (degrees + minutes + seconds)
					return Math.max(Math.min(totalDegrees, 180), -180)
				}
			} else {
				const parts = sanitizedValue.match(/([-EeWw]?)(\d{1,3}(\.\d+)?)/)
				if (parts) {
					const second = parts[1]
					const third = parts[2]
					if (second === undefined || third === undefined) return Number.NaN
					const sign = /^-|W|w/.test(second) ? -1 : 1
					const value = Number.parseFloat(third)
					return Math.max(Math.min(sign * value, 180), -180)
				}
			}
		}
		return Number.NaN
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
