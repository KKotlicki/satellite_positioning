import useStore from "@/store/store";
import { InputAdornment, TextField } from "@mui/material";
import { useZustand } from "use-zustand";


export default function ElevationPicker() {
	const elevationCutoff = useZustand(useStore, (state) => state.elevationCutoff)
	const changeElevationCutoff = useZustand(useStore, (state) => state.changeElevationCutoff)

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