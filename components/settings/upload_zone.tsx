import type { AstronomyData, AstronomyFile } from "@/global/types"
import {
	checkRnxType,
	parseAlmFile,
	parseRnxMeteo,
	parseRnxNavigation,
	parseRnxObservation
} from "@/services/file-parsing"
import { useActions } from "@/services/store"
import { useMeteoActions } from "@/stores/meteo-store"
import { Box } from "@mui/material"
import Typography from "@mui/material/Typography"
import { useCallback, useEffect, useState } from "react"

export default function UploadZone() {
	const [isDragging, setIsDragging] = useState<boolean>(false)

	const { changeNavigationFile } = useActions()
	const { changeObservationFile } = useActions()
	const { changeMeteoFile } = useMeteoActions()

	const updateStoreData = useCallback(
		<T extends AstronomyData>(
			content: string,
			fileName: string,
			parser: (content: string) => T,
			storeAction: (file: AstronomyFile<T>) => void
		) => {
			storeAction({
				fileName: fileName,
				content: parser(content)
			})
		},
		[]
	)

	const initRnxNavigation = useCallback(async () => {
		const response = await fetch("/BRDC00WRD_R_20240650000_01D_GN.rnx")
		const content = await response.text()
		console.log("laksfm")
		updateStoreData(
			content,
			"BRDC00WRD_R_20240650000_01D_GN.rnx",
			parseRnxNavigation,
			changeNavigationFile
		)
	}, [updateStoreData, changeNavigationFile])

	const initRnxObservation = useCallback(async () => {
		const response = await fetch("/JOZ200POL_R_20240650000_01D_30S_MO.rnx")
		const content = await response.text()
		updateStoreData(
			content,
			"JOZ200POL_R_20240650000_01D_30S_MO.rnx",
			parseRnxObservation,
			changeObservationFile
		)
	}, [updateStoreData, changeObservationFile])

	useEffect(() => {
		initRnxNavigation()
		initRnxObservation()
	}, [initRnxNavigation, initRnxObservation])

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
		handleFileDropped(file)
	}

	const handleChooseFile = () => {
		const fileInput = document.createElement("input")
		fileInput.type = "file"
		fileInput.accept = ".alm,.rnx"

		fileInput.multiple = false
		fileInput.onchange = async (e: Event) => {
			const target = e.target as HTMLInputElement
			if (target?.files) {
				const file = Array.from(target.files)[0]
				if (!file?.name) {
					return
				}
				handleFileDropped(file)
			}
		}
		fileInput.click()
	}

	const handleFileDropped = async (file: File) => {
		const content = await file?.text()
		const fileName = file.name
		const extension = file.name.split(".").pop()
		if (!content || !fileName || !extension) return

		if (extension === "alm")
			updateStoreData(content, fileName, parseAlmFile, changeNavigationFile)
		else if (extension === "rnx") {
			const rnxType = checkRnxType(content)
			switch (rnxType) {
				case "navigation":
					updateStoreData(
						content,
						fileName,
						parseRnxNavigation,
						changeNavigationFile
					)
					break
				case "observation":
					console.log("observation")
					console.log(parseRnxObservation(content))
					updateStoreData(
						content,
						fileName,
						parseRnxObservation,
						changeObservationFile
					)
					break
				case "meteo":
					updateStoreData(content, fileName, parseRnxMeteo, changeMeteoFile)
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
			borderRadius='10px'
			padding='1rem'
			display='flex'
			justifyContent='center'
			alignItems='center'
			height='100px'
			margin='1rem 0'
			color={isDragging ? "white" : "inherit"}
			position='relative'
			width='100%'
			sx={{
				cursor: "pointer",
				backgroundColor: isDragging ? "primary.light" : "inherit",
				transition: "all 0.3s ease-in-out"
			}}
		>
			<Typography textAlign='center'>Drag and drop Files</Typography>
		</Box>
	)
}
