import { useActions } from "@/services/store"
import { InputAdornment, TextField } from "@mui/material"
import { type ChangeEvent, useState } from "react"

export default function LongitudePicker() {
	const [longitudeValue, setLongitudeValue] = useState("E 0° 0' 0.0")

	const { changeLongitude } = useActions()

	const isValidLongitude = (value: string) => {
		const sanitizedValue = value.replace(/\s+/g, "").replace("''", "'")

		if (
			/^[-EeWw]?\d{1,3}°\d{1,2}'\d{1,2}(\.\d+)?['']?[EeWw]?$|^[-EeWw]?\d{1,3}(\.\d+)?['']?[EeWw]?$/.test(
				sanitizedValue
			)
		) {
			if (sanitizedValue.includes("°")) {
				const parts = sanitizedValue.match(
					/([-EeWw]?)(\d{1,3})°(\d{1,2})'(\d{1,2}(\.\d+)?['']?)([EeWw]?)/
				)

				if (parts === null) return false

				const degrees = parts[2]
				const minutes = parts[3]
				const seconds = parts[4]

				if (
					degrees === undefined ||
					minutes === undefined ||
					seconds === undefined
				)
					return false

				const totalDegrees =
					Number.parseFloat(degrees) +
					Number.parseFloat(minutes) / 60 +
					Number.parseFloat(seconds) / 3600
				return totalDegrees <= 180
			}
			const parts = sanitizedValue.match(
				/([-EeWw]?)(\d{1,3}(\.\d+)?)([EeWw]?)?/
			)

			if (parts === null) return false

			const degrees = parts[2]

			if (degrees === undefined) return false

			const totalDegrees = Number.parseFloat(degrees)
			return totalDegrees <= 180
		}
		return false
	}

	const parseLongitude = (value: string) => {
		const sanitizedValue = value.replace(/\s+/g, "").replace("''", "'")
		if (
			/^[-EeWw]?\s?\d{1,3}°\s?\d{1,2}'\s?\d{1,2}(\.\d+)?['']?[EeWw]?$/.test(
				sanitizedValue
			)
		) {
			if (sanitizedValue.includes("°")) {
				const parts = sanitizedValue.match(
					/([-EeWw]?)\s?(\d{1,3})°\s?(\d{1,2})'\s?(\d{1,2}(\.\d+)?['']?)?([EeWw]?)/
				)
				if (parts) {
					const signPart = parts[1] || parts[6]
					const degrees = parts[2]
					if (signPart === undefined || degrees === undefined) return Number.NaN
					const minutes = parts[3] ? Number.parseFloat(parts[3]) / 60 : 0
					const seconds = parts[4] ? Number.parseFloat(parts[4]) / 3600 : 0
					const sign = /^-|W|w/.test(signPart) ? -1 : 1
					return sign * (Number.parseFloat(degrees) + minutes + seconds)
				}
			}
		} else if (
			/^[-EeWw]?\s?\d+(\.\d+)?$/.test(sanitizedValue) ||
			/^[-EeWw]?\s?\d{1,3}$/.test(sanitizedValue)
		) {
			const parts = sanitizedValue.match(/([-EeWw]?)\s?(\d+(\.\d+)?)([EeWw]?)?/)
			if (parts) {
				const signPart = parts[1] || parts[4]
				const degrees = parts[2]
				if (signPart === undefined || degrees === undefined) return Number.NaN
				const sign = /^-|W|w/.test(signPart) ? -1 : 1
				return sign * Number.parseFloat(degrees)
			}
		}
		return Number.NaN
	}

	const handleLongitudeChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
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
