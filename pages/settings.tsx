import { Button, Card, CardActions, CardContent, CardHeader, InputAdornment, TextField, useTheme } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { FC, useState } from "react";

// Define your settings types here
type Settings = {
  [key: string]: any;
};

interface UploadZoneProps {
  onFilesDropped: (files: File[]) => void;
}

const UploadZone: FC<UploadZoneProps> = ({ onFilesDropped }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const theme = useTheme();

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    // Handle the dropped files here
    const files = Array.from(e.dataTransfer.files);
    onFilesDropped(files);
  };

  const handleChooseFile = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.alm,.yum'; // Acceptable file types
    fileInput.multiple = true;
    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target && target.files) {
        const files = Array.from(target.files);
        onFilesDropped(files);
      }
    };
    fileInput.click();
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleChooseFile}
      style={{
        border: isDragging ? '2px dashed blue' : '2px dashed grey',
        borderRadius: '10px',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100px',
        margin: '1rem 0',
        cursor: 'pointer',
        backgroundColor: isDragging ? theme.palette.primary.light : 'inherit',
        color: isDragging ? 'white' : 'inherit',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <p style={{ textAlign: 'center' }}>Drag and drop Almanac</p>
    </div>
  );
};

export default function Settings() {
  const theme = useTheme();
  const [value, setValue] = useState<Dayjs | null>(
    dayjs('2023-01-01T00:00:00.000Z'),
  );
  const [filesUploaded, setFilesUploaded] = useState(false);
  const handleFilesDropped = (files: File[]) => {
    if (files.length === 0) return;
    // check if file extension is .alm
    if (files[0].name.split('.').pop() !== 'alm') {
      alert('File type not supported');
      return;
    }
    console.log(files);
    setFilesUploaded(true); // <-- update state variable
  };

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
          <TextField
            label="Elevation cutoff"
            fullWidth
            margin="normal"
            defaultValue="7"
            InputProps={{
              endAdornment: <InputAdornment position="end">°</InputAdornment>,
            }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Start time and date"
              renderInput={(params) => <TextField {...params} margin="normal" />}
              value={value}
              onChange={(newValue) => {
                setValue(newValue);
              }}
              componentsProps={{
                actionBar: { actions: ["today"] },
              }}
            />
          </LocalizationProvider>
          <div style={{ position: 'relative', width: '100%' }}>
            <UploadZone onFilesDropped={handleFilesDropped} />
          </div>
        </CardContent>
        <CardActions style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button disabled={!filesUploaded}>Apply</Button>
        </CardActions>
      </Card>
    </>
  )
}
