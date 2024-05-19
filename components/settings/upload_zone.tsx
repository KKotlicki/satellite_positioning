import type { RinexMeteo, RinexNavigation, RinexObservation } from "@/global/types"
import { checkRnxType, parseAlmFile, parseRnxMeteo, parseRnxNavigation, parseRnxObservation } from "@/services/file-parsing"
import { useAlmanacActions, useAlmanacFile } from "@/stores/almanac-store"
import { useRinexActions, useRinexMeteoFile, useRinexNavigationFile, useRinexObservationFile } from "@/stores/rinex-store"
import { Box } from "@mui/material"
import Typography from "@mui/material/Typography"
import { useState } from "react"


export default function UploadZone() {
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const almanacFile = useAlmanacFile()
	const { changeAlmanacFile } = useAlmanacActions()
	const rinexNavigationFile = useRinexNavigationFile()
	const rinexObservationFile = useRinexObservationFile()
	const rinexMeteoFile = useRinexMeteoFile()
	const { changeRinexNavigationFile, changeRinexObservationFile, changeRinexMeteoFile } = useRinexActions()

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
		const file = Array.from(e.dataTransfer.files)[0]
		if (!file?.name) {
			throw new Error("No file name")
		}
		handleFilesDropped(file)
	}

	const handleChooseFile = () => {
		const fileInput = document.createElement("input")
		fileInput.type = "file"
		fileInput.accept = `.${[almanacFile.extensions, rinexNavigationFile.extensions, rinexObservationFile.extensions, rinexMeteoFile.extensions].flat().map((ext) => ext).filter((value, index, self) => self.indexOf(value) === index).sort().map((ext) => ext).filter((value) => value).map((ext) => ext).join(", .")}`

		fileInput.multiple = true
		fileInput.onchange = async (e: Event) => {
			const target = e.target as HTMLInputElement
			if (target?.files) {
				const file = Array.from(target.files)[0]
				if (!file?.name) {
					throw new Error("No file name")
				}
				handleFilesDropped(file)
			}
		}
		fileInput.click()
	}
	const handleFilesDropped = async (file: File) => {
		const almanac = new Map()
		const content = await file?.text()
		const extension = file.name.split('.').pop()
		if (!content || !extension) {
			return
		}
		if (almanacFile.extensions.includes(extension)) {
			parseAlmFile(content as string).forEach((value, key) => {
				almanac.set(key, value)
			})
			almanacFile.fileName = file?.name
			almanacFile.content = almanac
			changeAlmanacFile(almanacFile)
		}
		else {
			const rinex: RinexNavigation = {}
			const rnxType = checkRnxType(content)
			if (rinexNavigationFile.extensions.includes(extension) && rnxType === "navigation") {
				const rnxObject = parseRnxNavigation(content);
				if (!rnxObject) {
					return
				}

				for (const prn in rnxObject) {
					if (!rnxObject[prn]) return
					rinex[prn] = rnxObject[prn]
				}
				rinexNavigationFile.fileName = file?.name
				rinexNavigationFile.content = rinex
				changeRinexNavigationFile(rinexNavigationFile);
			}
			else if (rinexObservationFile.extensions.includes(extension) && rnxType === "observation") {
				const rinex: RinexObservation = {}
				const rnxObject = parseRnxObservation(content)
				for (const key in rnxObject) {
					if (!rnxObject[key]) throw new Error("Undefined key")
					rinex[key] = rnxObject[key]
				}
				rinexObservationFile.content = rinex
				changeRinexObservationFile(rinexObservationFile)
			}

			else if (rinexMeteoFile.extensions.includes(extension) && rnxType === "meteo") {
				const rinex: RinexMeteo = {}
				const rnxObject = parseRnxMeteo(content)
				for (const key in rnxObject) {
					if (!rnxObject[key]) throw new Error("Undefined key")
					rinex[key] = rnxObject[key]
				}
				rinexMeteoFile.content = rinex
				changeRinexMeteoFile(rinexMeteoFile)
			}
		}
	}

	return (
		<Box
			onDragEnter={handleDragEnter}
			onDragOver={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			onClick={handleChooseFile}
			border={isDragging ? "2px dashed blue" : "2px dashed grey"}
			borderRadius="10px"
			padding="1rem"
			display="flex"
			justifyContent="center"
			alignItems="center"
			height="100px"
			margin="1rem 0"
			color={isDragging ? "white" : "inherit"}
			position="relative"
			width="100%"
			sx={{
				cursor: "pointer",
				backgroundColor: isDragging ? "primary.light" : "inherit",
				transition: "all 0.3s ease-in-out"
			}}
		>
			<Typography textAlign="center">Drag and drop Files</Typography>
		</Box>
	)
}
