import type { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { medViewDateInputSx } from "../../../../sxConfigs/medViewDateInputSx";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/ru";
import { medViewDatePickerSx } from "../../../../sxConfigs/medViewDatePickerSx";

interface MedViewDateInputProps {
  label: string;
  value: Dayjs | null;
  handleDateInputChange: (value: Dayjs | null) => void;
}

export const MedViewDateInput = ({
  label,
  value,
  handleDateInputChange,
}: MedViewDateInputProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <DatePicker
        onChange={handleDateInputChange}
        value={value}
        label={label}
        slotProps={{
          desktopPaper: { sx: medViewDatePickerSx },
          mobilePaper: { sx: medViewDatePickerSx },
          textField: {
            variant: "filled",
            size: "small",
            fullWidth: true,
            slotProps: {
              input: { disableUnderline: true },
              inputLabel: { shrink: true },
            },
            sx: medViewDateInputSx,
          },
        }}
      />
    </LocalizationProvider>
  );
};
