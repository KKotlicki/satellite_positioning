import { useAlmanacActions } from "@/stores/almanac-store";
import { LocalizationProvider, DatePicker as MUIDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("UTC")


export default function DatePicker() {
  const [localDate, setLocalDate] = useState(dayjs())
  const { changeDate } = useAlmanacActions()

  const isValidDate = (date: Dayjs) => { return date?.isValid() }

  const handleDateChange = (newValue: Dayjs | null) => {
    const newDate = dayjs(newValue)
    setLocalDate(newDate)
    if (isValidDate(newDate)) {
      changeDate(newDate.startOf("day"))
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MUIDatePicker
        format='DD/MM/YYYY'
        label='Start date'
        slotProps={{
          textField: { variant: "outlined", margin: "normal" }
        }}
        value={localDate}
        onChange={handleDateChange}
        timezone="UTC"
      />
    </LocalizationProvider>
  )
}
