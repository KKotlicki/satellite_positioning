import useStore from "@/store/store";
import {
	InputAdornment,
	TextField
} from "@mui/material";


const HeightPicker = () => {
	const height = useStore((state) => state.height)
	const changeHeight = useStore((state) => state.changeHeight)

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
