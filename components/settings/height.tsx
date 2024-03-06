import useStore from "@/store/store";
import {
	InputAdornment,
	TextField
} from "@mui/material";
import { useZustand } from "use-zustand";


const HeightPicker = () => {
	const height = useZustand(useStore, (state) => state.height)
	const changeHeight = useZustand(useStore, (state) => state.changeHeight)

	return (
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
	)
}

export default HeightPicker
