import { theme } from "@/constants/constants"
import useStore from "@/store/store"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import { Card, CardContent, CardHeader, Slider } from "@mui/material"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import dayjs from "dayjs"
import { useState } from "react"
import { useZustand } from "use-zustand"
import { useInterval } from 'usehooks-ts'


export default function TimeSlider() {
  const date = useZustand(useStore, (state) => state.date)
  const time = useZustand(useStore, (state) => state.time)
  const changeTime = useZustand(useStore, (state) => state.changeTime)

  const [sliderDateDraft, setSliderDate] = useState(date)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const sliderValueToTime = (value: number) => {
    return dayjs(new Date())
      .startOf("day")
      .add(value * 10, "minute")
  }

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue))
      throw new Error("MUI Slider value return: Expected a number")
    if (newValue === 144) {
      const newDate = sliderDateDraft.add(1, "day")
      setSliderDate(newDate)
    } else {
      setSliderDate(date)
    }
    changeTime(newValue)
  }

  useInterval(() => {
    if (time === 144) {
      changeTime(0)
      setSliderDate(sliderDateDraft.add(1, "day"))
    } else {
      changeTime(time + 1)
    }
  }, isPlaying ? 10 : null)

  return (
    <Card
      sx={{
        width: "full-width",
        margin: "1rem"
      }}
      variant='outlined'
    >
      <CardHeader
        title='Local Time'
        style={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.divider
        }}
      />
      <CardContent>
        <Typography gutterBottom>
          {`${sliderDateDraft.format(
            "DD/MM/YYYY"
          )} ${sliderValueToTime(time).format("HH:mm")}`}
        </Typography>
        <Slider
          aria-label='Local Time'
          value={time}
          getAriaValueText={(value: number) =>
            sliderValueToTime(value).format("HH:mm")
          }
          valueLabelDisplay='off'
          step={1}
          marks
          min={0}
          max={144}
          onChange={handleSliderChange}
          onMouseDown={() => setIsPlaying(false)}
          onTouchStart={() => setIsPlaying(false)}
          sx={{
            '& .MuiSlider-thumb, & .MuiSlider-track, & .MuiSlider-rail, & .MuiSlider-mark, & .MuiSlider-markLabel, & .MuiSlider-valueLabel': {
              transition: 'none !important',
            },
          }}
        />
        <Box
          display='flex'
          justifyContent='center'
          style={{ marginBottom: "-16px" }}
        >
          <IconButton
            aria-label='play/pause'
            onClick={handlePlayPause}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  )
}
