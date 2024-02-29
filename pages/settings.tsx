import useStore from "@/store/store";
import { Card, CardContent, CardHeader, InputAdornment, TextField, useTheme } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FC, useState } from "react";

function parseAlmFile(input: string): Map<number, number[]> {
  let data: string = input

  let res = [] as number[][]

  let shiftToNext = 0

  let previousColumnsAmount = 0

  data.split("\n").forEach((line) => {
    const numbers = line.replace(/\-/g, " -").trim().split(/\s+/)

    if (numbers.length <= 1) {
      shiftToNext += previousColumnsAmount
      return
    }

    previousColumnsAmount = numbers.length + 1

    numbers.forEach((n, i) => {
      const satellite = res[i + shiftToNext]
      if (!satellite) res[i + shiftToNext] = []
      if (Number.isNaN(n)) return
      res[i + shiftToNext]!.push(+n)
    })
  })

  res = res.filter(x => x)

  const dic = new Map<number, number[]>()

  res.forEach((nums) => {
    dic.set(nums[0]!, nums.splice(1))
  })

  return dic
}

interface UploadZoneProps {
  onFilesDropped: (content: string | ArrayBuffer | null) => void;
}

const UploadZone: FC<UploadZoneProps> = ({ onFilesDropped }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const theme = useTheme();
  const changeAlmanacName = useStore((state) => state.changeAlmanacName)

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const text = await files[0]?.text()
    // get filename here
    if (!files[0]?.name) { throw new Error("No file name") }
    changeAlmanacName(files[0]?.name)

    onFilesDropped(text ?? "");
  };

  const handleChooseFile = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.alm,.yum';
    fileInput.multiple = true;
    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target && target.files) {
        const files = Array.from(target.files);
        const text = await files[0]?.text()
        // get filename here
        if (!files[0]?.name) { throw new Error("No file name") }
        changeAlmanacName(files[0]?.name)

        onFilesDropped(text ?? "");
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


  const changeAlmanac = useStore((state) => state.changeAlmanac)
  const handleFilesDropped = (content: string | ArrayBuffer | null) => {
    const almanac = new Map<number, number[]>();
    parseAlmFile(content as string).forEach((value, key) => {
      almanac.set(key, value);
    });
    changeAlmanac(almanac);
  };
  const latitude = useStore((state) => state.latitude)
  const changeLatitude = useStore((state) => state.changeLatitude)
  const longitude = useStore((state) => state.longitude)
  const changeLongitude = useStore((state) => state.changeLongitude)
  const height = useStore((state) => state.height)
  const changeHeight = useStore((state) => state.changeHeight)
  const elevationCutoff = useStore((state) => state.elevationCutoff)
  const changeElevationCutoff = useStore((state) => state.changeElevationCutoff)
  const date = useStore((state) => state.date)
  const changeDate = useStore((state) => state.changeDate)

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
            value={latitude}
            fullWidth
            margin="normal"
            placeholder="N 0° 0' 0"
            onChange={(e) => { changeLatitude(e.target.value) }}
            InputProps={{
              endAdornment: <InputAdornment position="end">°</InputAdornment>,
            }}
          />
          <TextField
            label="Longitude"
            value={longitude}
            fullWidth
            margin="normal"
            placeholder="E 0° 0' 0"
            onChange={(e) => { changeLongitude(e.target.value) }}
            InputProps={{
              endAdornment: <InputAdornment position="end">°</InputAdornment>,
            }}
          />
          <TextField
            label="Height"
            value={height}
            fullWidth
            margin="normal"
            placeholder="480"
            type="number"
            onChange={(e) => { changeHeight(Number(e.target.value)) }}
            InputProps={{
              endAdornment: <InputAdornment position="end">m</InputAdornment>,
            }}
          />
          <TextField
            label="Elevation cutoff"
            value={elevationCutoff}
            fullWidth
            margin="normal"
            placeholder="7"
            type="number"
            onChange={(e) => { changeElevationCutoff(Number(e.target.value)) }}
            InputProps={{
              endAdornment: <InputAdornment position="end">°</InputAdornment>,
            }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start date"
              slotProps={{ textField: { variant: 'outlined', margin: "normal" } }}
              value={date}
              onChange={(newValue) => {
                if (newValue === null) return;
                changeDate(newValue);
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
      </Card>
    </>
  )
};
