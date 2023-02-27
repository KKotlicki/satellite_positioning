import { Button, Card, CardActions, CardContent, CardHeader, useTheme, TextField, InputAdornment } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from "react";

export default function Settings() {
  const theme = useTheme();
  const [value, setValue] = useState<Dayjs | null>(
    dayjs('2023-01-01T00:00:00.000Z'),
  );

  return (
    <>
      <Card sx={{
        width: 'fit-content',
        margin: 'auto',
        marginTop: '1rem',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)'
      }} variant="outlined">
        <CardHeader title='Settings'
        style={{ borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.divider }}></CardHeader>
        <CardContent>
        <TextField
          label="Latitude"
          fullWidth
          margin="normal"
          defaultValue="N 0° 0' 0"
          InputProps={{
            endAdornment: <InputAdornment position="end">°</InputAdornment>,
          }}
        />
        <TextField
          label="Longitude"
          fullWidth
          margin="normal"
          defaultValue="E 0° 0' 0"
          InputProps={{
            endAdornment: <InputAdornment position="end">°</InputAdornment>,
          }}
        />
        <TextField
          label="Height"
          fullWidth
          margin="normal"
          defaultValue="480"
          InputProps={{
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label="Start time and date"
          renderInput={(params) => <TextField {...params} />}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          componentsProps={{
            actionBar: { actions: ["today"] },}}
        />
        </LocalizationProvider>
      </CardContent>
        <CardActions><Button>Apply</Button></CardActions>
      </Card>
    </>
  )
}
