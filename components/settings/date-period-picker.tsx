import { useRinexActions } from "@/stores/rinex-store";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateRangePicker as MUIDateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import type { DateRange } from "@mui/x-date-pickers-pro/models/range";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";


export default function DatePeriodPicker() {
  const [localDateRange, setLocalDateRange] = useState<DateRange<Dayjs>>([
    dayjs().startOf("day"),
    dayjs().startOf("day")
  ]);
  const { changeRinexObservationPeriod } = useRinexActions()
  console.log(localDateRange[0]?.toISOString())
  const isValidDate = (date: DateRange<Dayjs>) => {
    return date[0]?.isBefore(date[1]) && date[0]?.isValid() && date[1]?.isValid()
  }

  const handleDateChange = (newValue: DateRange<Dayjs>) => {
    if (newValue[0] === null || newValue[1] === null) {
      return
    }
    const newValueCorrected: DateRange<Dayjs>
      = [
        newValue[0].startOf("day"),
        newValue[1].startOf("day")
      ]
    setLocalDateRange(newValueCorrected)
    if (isValidDate(newValueCorrected)) {
      changeRinexObservationPeriod(newValueCorrected)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MUIDateRangePicker
        format='DD/MM/YYYY'
        label='Date Period'
        slotProps={{
          textField: { variant: "outlined", margin: "normal" }
        }}
        value={localDateRange}
        onChange={handleDateChange}
        timezone="UTC"
      />
    </LocalizationProvider>
  )
}
