import { useHeight, useNavigationActions } from "@/stores/navigation-store";
import { InputAdornment, TextField } from "@mui/material";


export default function HeightPicker() {
	const height = useHeight()
	const { changeHeight } = useNavigationActions()

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
