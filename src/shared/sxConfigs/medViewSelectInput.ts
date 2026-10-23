import { medViewFilledInputSx } from "./medViewFilledInputSx";

export const medViewSelectInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "var(--radius-l)",
    fontSize: "var(--fs-body)",
    fontFamily: "var(--inter)",
    fontWeight: "var(--fw-default)",
    backgroundColor: "var(--mt-surface)",
    transition: "box-shadow var(--mt-duration-fast) ease",
    "& fieldset": {
      borderColor: "var(--border-default)",
      fontFamily: "inherit",
      fontWeight: "inherit",
      transition: "border-color var(--mt-duration-fast) ease",
    },

    "&:hover:not(.Mui-disabled):not(.Mui-error) fieldset": {
      borderColor: "var(--border-hover)",
    },

    "&.Mui-focused:not(.Mui-disabled):not(.Mui-error)": {
      boxShadow:
        "0 0 0 2px color-mix(in srgb, var(--border-focus) 15%, transparent)",
    },

    "&.Mui-focused:not(.Mui-disabled):not(.Mui-error) fieldset": {
      borderColor: "var(--border-focus)",
      borderWidth: "1px",
    },
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "var(--text-secondary)",
    opacity: 1,
  },
  "& .MuiInputLabel-root": {
    color: "var(--text-secondary)",
    fontSize: "var(--fs-body)",
    fontFamily: "var(--inter)",
    fontWeight: "var(--fw-default)",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--text-primary)" },
  ...medViewFilledInputSx,
};
