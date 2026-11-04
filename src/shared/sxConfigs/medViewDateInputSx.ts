import { medViewFilledInputSx } from "./medViewFilledInputSx";

export const medViewDateInputSx = {
  "& .MuiInputLabel-root": {
    color: "var(--text-secondary)",
    fontSize: "var(--fs-body)",
    fontFamily: "var(--inter)",
    fontWeight: "var(--fw-default)",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--text-primary)",
  },

  "& .MuiPickersInputBase-root": {
    fontSize: "var(--fs-body)",
    fontFamily: "var(--inter)",
    fontWeight: "var(--fw-default)",
    borderRadius: "var(--radius-l)",
    backgroundColor: "var(--mt-surface)",
    transition: "box-shadow var(--mt-duration-fast) ease",
  },

  "& .MuiPickersInputBase-sectionsContainer": {
    fontFamily: "inherit",
    opacity: 1,
  },

  "& .MuiPickersSectionList-section": {
    fontFamily: "inherit",
  },

  "& .MuiPickersOutlinedInput-root.Mui-focused:not(.Mui-disabled):not(.Mui-error)": {
    boxShadow:
      "0 0 0 2px color-mix(in srgb, var(--border-focus) 15%, transparent)",
  },

  "& .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: "var(--border-default)",
    fontFamily: "inherit",
    fontWeight: "inherit",
    transition: "border-color var(--mt-duration-fast) ease",
    "& legend > span": {
      fontFamily: "inherit",
      fontWeight: "inherit",
    },
  },

  "& .MuiPickersInputBase-root:hover:not(.Mui-disabled):not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: "var(--border-hover)",
  },

  "& .MuiPickersInputBase-root.Mui-focused:not(.Mui-disabled):not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline":
    {
      borderColor: "var(--border-focus)",
      borderWidth: "1px",
    },
  ...medViewFilledInputSx,
  "& .MuiInputLabel-filled.MuiInputLabel-shrink": {
    maxWidth: "calc((100% - var(--mt-space-12)) / 0.75)",
  },
};
