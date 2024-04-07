import useStore from "@/store/store";
import { DatePicker as MUIDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useState } from "react";
import { useZustand } from "use-zustand";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("UTC")

const DatePicker = () => {
  const [localDate, setLocalDate] = useState(dayjs())
  const changeDate = useZustand(useStore, (state) => state.changeDate)

  const minDate = dayjs("2024-02-19")
  const maxDate = dayjs("2100-01-01")

  const isValidDate = (date: dayjs.Dayjs) => {
    return date?.isValid() && date.isAfter(minDate) && date.isBefore(maxDate)
  }

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
        minDate={minDate}
        maxDate={maxDate.subtract(1, 'day')}
        timezone="UTC"
      />
    </LocalizationProvider>
  )
}

export default DatePicker
