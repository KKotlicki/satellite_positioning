import { useAlmanacActions } from "@/stores/almanac-store";
import { InputAdornment, TextField } from "@mui/material";
import { type ChangeEvent, useState } from "react";


export default function LatitudePicker() {
  const [latitudeValue, setLatitudeValue] = useState("N 0° 0' 0.0")

  const { changeLatitude } = useAlmanacActions()

  const isValidLatitude = (value: string) => {
    const sanitizedValue = value.replace(/\s+/g, "")

    if (
      /^[-NnSs]?\d{1,2}°\d{1,2}'\d{1,2}(\.\d+)?$|^[-NnSs]?\d+(\.\d+)?$/.test(
        sanitizedValue
      )
    ) {
      if (sanitizedValue.includes("°")) {
        const parts = sanitizedValue.match(
          /([-NnSs]?)(\d{1,2})°(\d{1,2})'(\d{1,2}(\.\d+)?)/
        )

        if (parts === null) return false

        const third = parts[2]
        const fourth = parts[3]
        const fifth = parts[4]

        if (third === undefined || fourth === undefined || fifth === undefined) return false

        if (parts) {
          const degrees = Number.parseFloat(third)
          const minutes = Number.parseFloat(fourth) / 60
          const seconds = Number.parseFloat(fifth) / 3600
          const totalDegrees = degrees + minutes + seconds
          return totalDegrees <= 90
        }
      } else {
        const parts = sanitizedValue.match(/([-NnSs]?)(\d+(\.\d+)?)/)

        if (parts === null) return false

        const third = parts[2]

        if (third === undefined) return false

        if (parts) {
          const value = Number.parseFloat(third)
          return value <= 90
        }
      }
    }
    return false
  }

  const parseLatitude = (value: string) => {
    const sanitizedValue = value.replace(/\s+/g, "")
    if (
      /^[-NnSs]?\s?\d{1,2}°\s?\d{1,2}'\s?\d{1,2}(\.\d+)?$/.test(sanitizedValue)
    ) {
      if (sanitizedValue.includes("°")) {
        const parts = sanitizedValue.match(
          /([-NnSs]?)\s?(\d{1,2})°\s?(\d{1,2})'\s?(\d{1,2}(\.\d+)?)?/
        )
        if (parts) {
          const second = parts[1]
          const third = parts[2]
          if (second === undefined || third === undefined) return Number.NaN
          const degrees = Number.parseFloat(third)
          const minutes = parts[3] ? Number.parseFloat(parts[3]) / 60 : 0
          const seconds = parts[4] ? Number.parseFloat(parts[4]) / 3600 : 0
          const sign = /^-|S|s/.test(second) ? -1 : 1
          return sign * (degrees + minutes + seconds)
        }
      }
    } else if (
      /^[-NnSs]?\s?\d+(\.\d+)?$/.test(sanitizedValue) ||
      /^[-NnSs]?\s?\d{1,2}$/.test(sanitizedValue)
    ) {
      const parts = sanitizedValue.match(/([-NnSs]?)\s?(\d+(\.\d+)?)/)
      if (parts) {
        const second = parts[1]
        const third = parts[2]
        if (second === undefined || third === undefined) return Number.NaN
        const sign = /^-|S|s/.test(second) ? -1 : 1
        return sign * Number.parseFloat(third)
      }
    }
    return Number.NaN
  }

  const handleLatitudeChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLatitudeValue(newValue)

    if (isValidLatitude(newValue)) {
      changeLatitude(parseLatitude(newValue))
    }
  }

  return (
    <TextField
      label='Latitude'
      value={latitudeValue}
      onChange={handleLatitudeChange}
      fullWidth
      margin='normal'
      placeholder="N 0° 0' 0.0"
      InputProps={{
        endAdornment: <InputAdornment position='end'>°</InputAdornment>
      }}
      error={!isValidLatitude(latitudeValue)}
    />
  )
}
