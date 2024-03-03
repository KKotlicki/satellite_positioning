import useStore from "@/store/store"
import {
	Card,
	CardContent,
	CardHeader,
	InputAdornment,
	TextField,
	useTheme
} from "@mui/material"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs, { Dayjs } from "dayjs"
import { FC, useState } from "react"

function parseAlmFile(input: string): Map<number, number[]> {
	const data: string = input

	let res = [] as number[][]

	let shiftToNext = 0

	let previousColumnsAmount = 0

	data.split("\n").forEach((line) => {
		const numbers = line.replace(/\-/g, " -").trim().split(/\s+/)

		if (numbers.length <= 1) {
			shiftToNext += previousColumnsAmount
			return
		}

		previousColumnsAmount = numbers.length + 1

		numbers.forEach((n, i) => {
			const satellite = res[i + shiftToNext]
			if (!satellite) res[i + shiftToNext] = []
			if (Number.isNaN(n)) return
			res[i + shiftToNext]?.push(+n)
		})
	})

	res = res.filter((x) => x)

	const dic = new Map<number, number[]>()

	res.forEach((nums) => {
		dic.set(nums[0]!, nums.splice(1))
	})

	return dic
}

interface UploadZoneProps {
	onFilesDropped: (content: string | ArrayBuffer | null) => void
}

const UploadZone: FC<UploadZoneProps> = ({ onFilesDropped }) => {
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const theme = useTheme()
	const changeAlmanacName = useStore((state) => state.changeAlmanacName)

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)
		const files = Array.from(e.dataTransfer.files)
		const text = await files[0]?.text()
		if (!files[0]?.name) {
			throw new Error("No file name")
		}
		changeAlmanacName(files[0]?.name)

		onFilesDropped(text ?? "")
	}

	const handleChooseFile = () => {
		const fileInput = document.createElement("input")
		fileInput.type = "file"
		fileInput.accept = ".alm"
		fileInput.multiple = true
		fileInput.onchange = async (e: Event) => {
			const target = e.target as HTMLInputElement
			if (target?.files) {
				const files = Array.from(target.files)
				const text = await files[0]?.text()
				if (!files[0]?.name) {
					throw new Error("No file name")
				}
				changeAlmanacName(files[0]?.name)

				onFilesDropped(text ?? "")
			}
		}
		fileInput.click()
	}

	return (
		<div
			onDragEnter={handleDragEnter}
			onDragOver={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			onClick={handleChooseFile}
			style={{
				border: isDragging ? "2px dashed blue" : "2px dashed grey",
				borderRadius: "10px",
				padding: "1rem",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100px",
				margin: "1rem 0",
				cursor: "pointer",
				backgroundColor: isDragging ? theme.palette.primary.light : "inherit",
				color: isDragging ? "white" : "inherit",
				transition: "all 0.3s ease-in-out"
			}}
		>
			<p style={{ textAlign: "center" }}>Drag and drop Almanac</p>
		</div>
	)
}

const Settings = () => {
	const theme = useTheme()

	const changeAlmanac = useStore((state) => state.changeAlmanac)
	const handleFilesDropped = (content: string | ArrayBuffer | null) => {
		const almanac = new Map<number, number[]>()
		parseAlmFile(content as string).forEach((value, key) => {
			almanac.set(key, value)
		})
		changeAlmanac(almanac)
	}
	const [latitudeValue, setLatitudeValue] = useState("N 0° 0' 0.0")
	const [longitudeValue, setLongitudeValue] = useState("E 0° 0' 0.0")

	const changeLatitude = useStore((state) => state.changeLatitude)
	const changeLongitude = useStore((state) => state.changeLongitude)

	const isValidLatitude = (value) => {
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
				if (parts) {
					const degrees = parseFloat(parts[2])
					const minutes = parseFloat(parts[3]) / 60
					const seconds = parseFloat(parts[4]) / 3600
					const totalDegrees = degrees + minutes + seconds
					return totalDegrees <= 90
				}
			} else {
				const parts = sanitizedValue.match(/([-NnSs]?)(\d+(\.\d+)?)/)
				if (parts) {
					const value = parseFloat(parts[2])
					return value <= 90
				}
			}
		}
		return false
	}

	const isValidLongitude = (value) => {
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
					const degrees = parseFloat(parts[2])
					const minutes = parseFloat(parts[3]) / 60
					const seconds = parseFloat(parts[4]) / 3600
					const totalDegrees = degrees + minutes + seconds
					return totalDegrees <= 180 && totalDegrees >= -180
				}
			} else {
				const parts = sanitizedValue.match(/([-EeWw]?)(\d{1,3}(\.\d+)?)/)
				if (parts) {
					const value = parseFloat(parts[2])
					const sign = /^-|W|w/.test(parts[1]) ? -1 : 1
					const totalDegrees = sign * value
					return totalDegrees <= 180 && totalDegrees >= -180
				}
			}
		}
		return false
	}

	const parseLatitude = (value) => {
		const sanitizedValue = value.replace(/\s+/g, "")
		if (
			/^[-NnSs]?\s?\d{1,2}°\s?\d{1,2}'\s?\d{1,2}(\.\d+)?$/.test(sanitizedValue)
		) {
			if (sanitizedValue.includes("°")) {
				const parts = sanitizedValue.match(
					/([-NnSs]?)\s?(\d{1,2})°\s?(\d{1,2})'\s?(\d{1,2}(\.\d+)?)?/
				)
				if (parts) {
					const degrees = parseFloat(parts[2])
					const minutes = parts[3] ? parseFloat(parts[3]) / 60 : 0
					const seconds = parts[4] ? parseFloat(parts[4]) / 3600 : 0
					const sign = /^-|S|s/.test(parts[1]) ? -1 : 1
					return sign * (degrees + minutes + seconds)
				}
			}
		} else if (
			/^[-NnSs]?\s?\d+(\.\d+)?$/.test(sanitizedValue) ||
			/^[-NnSs]?\s?\d{1,2}$/.test(sanitizedValue)
		) {
			const parts = sanitizedValue.match(/([-NnSs]?)\s?(\d+(\.\d+)?)/)
			if (parts) {
				const sign = /^-|S|s/.test(parts[1]) ? -1 : 1
				return sign * parseFloat(parts[2])
			}
		}
		return NaN
	}

	const parseLongitude = (value) => {
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
					const degrees = parseFloat(parts[2])
					const minutes = parts[3] ? parseFloat(parts[3]) / 60 : 0
					const seconds = parts[4] ? parseFloat(parts[4]) / 3600 : 0
					const sign = /^-|W|w/.test(parts[1]) ? -1 : 1
					const totalDegrees = sign * (degrees + minutes + seconds)
					return Math.max(Math.min(totalDegrees, 180), -180)
				}
			} else {
				const parts = sanitizedValue.match(/([-EeWw]?)(\d{1,3}(\.\d+)?)/)
				if (parts) {
					const sign = /^-|W|w/.test(parts[1]) ? -1 : 1
					const value = parseFloat(parts[2])
					return Math.max(Math.min(sign * value, 180), -180)
				}
			}
		}
		return NaN
	}

	const handleLatitudeChange = (e) => {
		const newValue = e.target.value
		setLatitudeValue(newValue)

		if (isValidLatitude(newValue)) {
			changeLatitude(parseLatitude(newValue))
		}
	}

	const handleLongitudeChange = (e) => {
		const newValue = e.target.value
		setLongitudeValue(newValue)

		if (isValidLongitude(newValue)) {
			changeLongitude(parseLongitude(newValue))
		}
	}

	const [localDate, setLocalDate] = useState(dayjs())
	const changeDate = useStore((state) => state.changeDate)

	const minDate = dayjs("2024-02-19")
	const maxDate = dayjs("2099-12-31")

	const isValidDate = (date: dayjs.Dayjs) => {
		return date?.isValid() && date.isAfter(minDate) && date.isBefore(maxDate)
	}

	const handleDateChange = (newValue: Dayjs | null) => {
		const newDate = dayjs(newValue)
		setLocalDate(newDate)
		if (isValidDate(newDate)) {
			changeDate(newDate)
		}
	}

	const height = useStore((state) => state.height)
	const changeHeight = useStore((state) => state.changeHeight)
	const elevationCutoff = useStore((state) => state.elevationCutoff)
	const changeElevationCutoff = useStore((state) => state.changeElevationCutoff)

	return (
		<>
			<Card
				sx={{
					width: "fit-content",
					margin: "auto",
					marginTop: "1rem",
					position: "absolute",
					left: "50%",
					transform: "translateX(-50%)"
				}}
				variant='outlined'
			>
				<CardHeader
					title='Settings'
					style={{
						borderBottom: `1px solid ${theme.palette.divider}`,
						backgroundColor: theme.palette.divider
					}}
				/>
				<CardContent>
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
					<TextField
						label='Height'
						value={height}
						fullWidth
						margin='normal'
						placeholder='480'
						type='number'
						onChange={(e) => {
							changeHeight(Number(e.target.value))
						}}
						InputProps={{
							endAdornment: <InputAdornment position='end'>m</InputAdornment>
						}}
					/>
					<TextField
						label='Elevation cutoff'
						value={elevationCutoff}
						fullWidth
						margin='normal'
						placeholder='7'
						type='number'
						inputProps={{ min: 0 }}
						onChange={(e) => {
							changeElevationCutoff(Number(e.target.value))
						}}
						InputProps={{
							endAdornment: <InputAdornment position='end'>°</InputAdornment>
						}}
					/>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							format='DD/MM/YYYY'
							label='Start date'
							slotProps={{
								textField: { variant: "outlined", margin: "normal" }
							}}
							value={localDate}
							onChange={handleDateChange}
							minDate={minDate}
							maxDate={maxDate}
						/>
					</LocalizationProvider>
					<div style={{ position: "relative", width: "100%" }}>
						<UploadZone onFilesDropped={handleFilesDropped} />
					</div>
				</CardContent>
			</Card>
		</>
	)
}

export default Settings
