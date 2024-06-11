import { useNavigationActions } from "@/stores/navigation-store";
import { InputAdornment, TextField } from "@mui/material";
import { type ChangeEvent, useState } from "react";

export default function LatitudePicker() {
  const [latitudeValue, setLatitudeValue] = useState("N 0° 0' 0.0")

  const { changeLatitude } = useNavigationActions()

  const isValidLatitude = (value: string) => {
    const sanitizedValue = value.replace(/\s+/g, "").replace("''", "'")

    if (
      /^[-NnSs]?\d{1,2}°\d{1,2}'\d{1,2}(\.\d+)?['']?[NnSs]?$|^[-NnSs]?\d+(\.\d+)?['']?[NnSs]?$/.test(
        sanitizedValue
      )
    ) {
      if (sanitizedValue.includes("°")) {
        const parts = sanitizedValue.match(
          /([-NnSs]?)(\d{1,2})°(\d{1,2})'(\d{1,2}(\.\d+)?['']?)([NnSs]?)/
        )

        if (parts === null) return false

        const degrees = parts[2]
        const minutes = parts[3]
        const seconds = parts[4]

        if (degrees === undefined || minutes === undefined || seconds === undefined) return false

        const totalDegrees = Number.parseFloat(degrees) + Number.parseFloat(minutes) / 60 + Number.parseFloat(seconds) / 3600
        return totalDegrees <= 90
      }
        const parts = sanitizedValue.match(/([-NnSs]?)(\d+(\.\d+)?)([NnSs]?)?/)

        if (parts === null) return false

        const degrees = parts[2]

        if (degrees === undefined) return false

        const totalDegrees = Number.parseFloat(degrees)
        return totalDegrees <= 90
    }
    return false
  }

  const parseLatitude = (value: string) => {
    const sanitizedValue = value.replace(/\s+/g, "").replace("''", "'")
    if (
      /^[-NnSs]?\s?\d{1,2}°\s?\d{1,2}'\s?\d{1,2}(\.\d+)?['']?[NnSs]?$/.test(sanitizedValue)
    ) {
      if (sanitizedValue.includes("°")) {
        const parts = sanitizedValue.match(
          /([-NnSs]?)\s?(\d{1,2})°\s?(\d{1,2})'\s?(\d{1,2}(\.\d+)?['']?)?([NnSs]?)/
        )
        if (parts) {
          const signPart = parts[1] || parts[6]
          const degrees = parts[2]
          if (signPart === undefined || degrees === undefined) return Number.NaN
          const minutes = parts[3] ? Number.parseFloat(parts[3]) / 60 : 0
          const seconds = parts[4] ? Number.parseFloat(parts[4]) / 3600 : 0
          const sign = /^-|S|s/.test(signPart) ? -1 : 1
          return sign * (Number.parseFloat(degrees) + minutes + seconds)
        }
      }
    } else if (
      /^[-NnSs]?\s?\d+(\.\d+)?$/.test(sanitizedValue) ||
      /^[-NnSs]?\s?\d{1,2}$/.test(sanitizedValue)
    ) {
      const parts = sanitizedValue.match(/([-NnSs]?)\s?(\d+(\.\d+)?)([NnSs]?)?/)
      if (parts) {
        const signPart = parts[1] || parts[4]
        const degrees = parts[2]
        if (signPart === undefined || degrees === undefined) return Number.NaN
        const sign = /^-|S|s/.test(signPart) ? -1 : 1
        return sign * Number.parseFloat(degrees)
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
