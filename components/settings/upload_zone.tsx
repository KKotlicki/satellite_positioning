import { useAlmanacActions, useAlmanacFile } from "@/stores/almanac-store"
import { Box } from "@mui/material"
import Typography from "@mui/material/Typography"
import { useState } from "react"


export default function UploadZone() {
	function parseAlmFile(input: string): Map<number, number[]> {
		const data: string = input

		let res = [] as number[][]
		let shiftToNext = 0
		let previousColumnsAmount = 0

		for (const line of data.split("\n")) {
			const numbers = line.replace(/\-/g, " -").trim().split(/\s+/)

			if (numbers.length <= 1) {
				shiftToNext += previousColumnsAmount
				continue
			}

			previousColumnsAmount = numbers.length + 1

			for (let i = 0; i < numbers.length; i++) {
				const n = numbers[i]
				if (n === undefined) throw new Error("Undefined number")
				const satellite = res[i + shiftToNext]
				if (!satellite) res[i + shiftToNext] = []
				if (Number.isNaN(n)) continue
				res[i + shiftToNext]?.push(+n)
			}
		}

		res = res.filter((x) => x)
		const dic = new Map<number, number[]>()

		for (const nums of res) {
			const key = nums[0]
			if (key === undefined) throw new Error("Undefined key")
			dic.set(key, nums.splice(1))
		}

		return dic
	}

	const [isDragging, setIsDragging] = useState<boolean>(false)
	const almanacFile = useAlmanacFile()
	const { changeAlmanacFile } = useAlmanacActions()

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
		almanacFile.fileName = files[0]?.name
		changeAlmanacFile(almanacFile)
		handleFilesDropped(text ?? "")
	}

	const handleChooseFile = () => {
		const fileInput = document.createElement("input")
		fileInput.type = "file"
		fileInput.accept = `.${almanacFile.extensions.join(", .")}`
		fileInput.multiple = true
		fileInput.onchange = async (e: Event) => {
			const target = e.target as HTMLInputElement
			if (target?.files) {
				const files = Array.from(target.files)
				const text = await files[0]?.text()
				if (!files[0]?.name) {
					throw new Error("No file name")
				}
				almanacFile.fileName = files[0]?.name
				changeAlmanacFile(almanacFile)

				handleFilesDropped(text ?? "")
			}
		}
		fileInput.click()
	}
	const handleFilesDropped = (content: string | ArrayBuffer | null) => {
		const almanac = new Map<number, number[]>()
		parseAlmFile(content as string).forEach((value, key) => {
			almanac.set(key, value)
		})
		almanacFile.content = almanac
		changeAlmanacFile(almanacFile)
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
