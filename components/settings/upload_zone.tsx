import type { Almanac, AstronomyData, AstronomyFile, RinexMeteo, RinexNavigation, RinexObservation } from "@/global/types"
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

	function updateStoreData<T extends AstronomyFile<Almanac> | AstronomyFile<RinexNavigation> | AstronomyFile<RinexObservation> | AstronomyFile<RinexMeteo>>
		(content: string, fileName: string, storeFile: T,
			parser: (content: string) => AstronomyData,
			storeAction: (content: T) => void) {

		storeFile.fileName = fileName
		storeFile.content = parser(content)
		storeAction(storeFile);
	}

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
		fileInput.accept = `.${[almanacFile.extensions, rinexNavigationFile.extensions, rinexObservationFile.extensions,
		rinexMeteoFile.extensions].flat().map((ext) => ext).filter((value, index, self) => self.indexOf(value) === index).sort().map((ext) => ext).filter((value) => value).map((ext) => ext).join(", .")}`

		fileInput.multiple = true
		fileInput.onchange = async (e: Event) => {
			const target = e.target as HTMLInputElement
			if (target?.files) {
				const file = Array.from(target.files)[0]
				if (!file?.name) {
					return
				}
				handleFilesDropped(file)
			}
		}
		fileInput.click()
	}
	const handleFilesDropped = async (file: File) => {
		const content = await file?.text()
		const fileName = file?.name
		const extension = file.name.split('.').pop()
		if (!content || !extension) return

		if (almanacFile.extensions.includes(extension))
			updateStoreData(content, fileName, almanacFile, parseAlmFile, changeAlmanacFile)

		else {
			const rnxType = checkRnxType(content)
			switch (rnxType) {
				case "navigation":
					if (!rinexNavigationFile.extensions.includes(extension)) return
					updateStoreData(content, fileName, rinexNavigationFile, parseRnxNavigation, changeRinexNavigationFile)
					break
				case "observation":
					if (!rinexObservationFile.extensions.includes(extension)) return
					updateStoreData(content, fileName, rinexObservationFile, parseRnxObservation, changeRinexObservationFile)
					break
				case "meteo":
					if (!rinexMeteoFile.extensions.includes(extension)) return
					updateStoreData(content, fileName, rinexMeteoFile, parseRnxMeteo, changeRinexMeteoFile)
					break
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
