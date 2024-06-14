import { useActions, useElevationCutoff } from "@/services/store"
import { InputAdornment, TextField } from "@mui/material"

export default function ElevationPicker() {
	const elevationCutoff = useElevationCutoff()
	const { changeElevationCutoff } = useActions()

	return (
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
	)
}
