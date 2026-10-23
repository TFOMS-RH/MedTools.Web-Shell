import { medViewPopupSx } from "./medViewPopupSx";

export const medViewDatePickerSx = {
  ...medViewPopupSx,
  "& .MuiDateCalendar-root": { fontFamily: "var(--inter)" },
  "& .MuiButtonBase-root:focus-visible, & .MuiButtonBase-root.Mui-focusVisible, & .MuiYearCalendar-button:focus-visible, & .MuiMonthCalendar-button:focus-visible": {
    outline: "2px solid var(--mt-medview-accent)",
    outlineOffset: "-2px",
  },
  "& .MuiPickerDay-root, & .MuiYearCalendar-button, & .MuiMonthCalendar-button": {
    fontFamily: "var(--inter)",
    "&:hover:not(.Mui-disabled)": { backgroundColor: "var(--mt-medview-cover)" },
    "&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus": {
      backgroundColor: "var(--mt-medview-accent)",
      color: "var(--mt-surface)",
    },
    "&.Mui-selected:focus-visible": { outlineColor: "var(--mt-surface)" },
  },
  "& .MuiPickerDay-today:not(.Mui-selected)": { borderColor: "var(--mt-medview-accent)" },
  "& .MuiPickersLayout-actionBar .MuiButton-root": { color: "var(--mt-medview-accent)" },
};
