import { useNavigationActions, useSelectedTocs } from "@/stores/navigation-store";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateRangePicker as MUIDateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import type { DateRange } from "@mui/x-date-pickers-pro/models/range";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("UTC");


export default function DatePeriodPicker() {
  const { changeSelectedTocs } = useNavigationActions();
  const selectedTocs = useSelectedTocs();

  const firstToc = selectedTocs[0];
  const lastToc = selectedTocs[selectedTocs.length - 1];
  if (firstToc === undefined || lastToc === undefined) throw new Error("First or last TOC is undefined");
  const initialStartDate = dayjs.utc((firstToc + 315964800) * 1000);
  const initialEndDate = dayjs.utc((lastToc + 315964800) * 1000);

  const [localDateRange, setLocalDateRange] = useState<DateRange<Dayjs>>([
    initialStartDate,
    initialEndDate
  ]);

  useEffect(() => {
    const newFirstToc = selectedTocs[0];
    const newLastToc = selectedTocs[selectedTocs.length - 1];
    if (newFirstToc === undefined || newLastToc === undefined) return;
    const newStartDate = dayjs.utc((newFirstToc + 315964800) * 1000);
    const newEndDate = dayjs.utc((newLastToc + 315964800) * 1000);
    setLocalDateRange([newStartDate, newEndDate]);
  }, [selectedTocs]);

  const isValidDate = (date: DateRange<Dayjs>) => {
    return date[0]?.isBefore(date[1]) && date[0]?.isValid() && date[1]?.isValid();
  };

  const handleDateChange = (newValue: DateRange<Dayjs>) => {
    if (newValue[0] === null || newValue[1] === null) {
      return;
    }
    const newValueCorrected: DateRange<Dayjs> = [
      newValue[0].utc().startOf("day"),
      newValue[1].utc().startOf("day")
    ];
    setLocalDateRange(newValueCorrected);
    if (isValidDate(newValueCorrected)) {
      const newSelectedTocs = generateSelectedTocs(newValueCorrected);
      changeSelectedTocs(newSelectedTocs);
    }
  };

  const generateSelectedTocs = (dateRange: DateRange<Dayjs>): number[] => {
    const startDate = dateRange[0]
    const endDate = dateRange[1]
    if (!startDate || !endDate) return [];
    const start = startDate.unix() - 315964800;
    const end = endDate.unix() - 315964800;
    const interval = (end - start) / 144;
    const tocs = Array.from({ length: 145 }, (_, i) => Math.round(start + i * interval));
    return tocs;
  };

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
  );
}
