import { Button, Card, CardActions, CardContent, CardHeader, useTheme, TextField } from "@mui/material";

export default function Settings() {
  const theme = useTheme();
  return (
    <>
      <Card sx={{
        width: 'fit-content',
        margin: 'auto',
        marginTop: '1rem',
        
      }} variant="outlined">
        <CardHeader title='Settings'
        style={{ borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.divider }}></CardHeader>
        {/* make Material-UI input fields with descriptions on the left: Latitude, Longitude, height, day, time */}
        <CardContent>
        <TextField
          label="Latitude"
          // InputLabelProps={{ position: "left" }}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Longitude"
          // InputLabelProps={{ position: "left" }}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Height"
          // InputLabelProps={{ position: "left" }}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Day"
          // InputLabelProps={{ position: "left" }}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Time"
          // InputLabelProps={{ position: "left" }}
          fullWidth
          margin="normal"
        />
      </CardContent>

        <CardActions><Button>Apply</Button></CardActions>
      </Card>
    </>
  )
}
