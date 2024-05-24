import { theme } from "@/global/constants";
import { useNavigationActions, useSelectedTocs, useTime } from "@/stores/navigation-store";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Card, CardContent, CardHeader, Slider } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useInterval } from 'usehooks-ts';


export default function DateTimeSlider() {
  const selectedTocs = useSelectedTocs();
  const time = useTime();
  const { changeTime } = useNavigationActions();

  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderTime, setSliderTime] = useState(time);

  useEffect(() => {
    setSliderTime(time);
  }, [time]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const sliderValueToDateTime = (value: number) => {
    const toc = selectedTocs[value];
    if (toc === undefined) return dayjs.utc(0);
    return dayjs.utc((toc + 315964800) * 1000);
  };

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue))
      throw new Error("MUI Slider value return: Expected a number");
    setSliderTime(newValue);
    changeTime(newValue);
  };

  useInterval(() => {
    if (isPlaying) {
      changeTime(sliderTime === 144 ? 0 : sliderTime + 1);
    }
  }, isPlaying ? 200 : null);

  return (
    <Card
      sx={{
        width: "full-width",
        margin: "1rem"
      }}
      variant='outlined'
    >
      <CardHeader
        title='Time'
        style={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.divider
        }}
      />
      <CardContent>
        <Typography gutterBottom>
          {sliderValueToDateTime(sliderTime).format("DD/MM/YYYY HH:mm:ss")}
        </Typography>
        <Slider
          aria-label='UTC Date and Time'
          value={sliderTime}
          getAriaValueText={(value: number) =>
            sliderValueToDateTime(value).format("HH:mm:ss")
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
  );
}
