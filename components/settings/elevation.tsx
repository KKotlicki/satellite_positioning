import useStore from "@/store/store";
import {
	InputAdornment,
	TextField
} from "@mui/material";


const ElevationPicker = () => {
	const elevationCutoff = useStore((state) => state.elevationCutoff)
	const changeElevationCutoff = useStore((state) => state.changeElevationCutoff)

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

export default ElevationPicker
