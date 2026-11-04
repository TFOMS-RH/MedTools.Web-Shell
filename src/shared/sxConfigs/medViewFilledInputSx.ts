export const medViewFilledInputSx = {
  "& .MuiFilledInput-root, & .MuiPickersFilledInput-root": {
    minHeight: "var(--mt-space-12)",
    borderRadius: "var(--mt-radius-control)",
    backgroundColor: "var(--mt-surface)",
    fontFamily: "var(--inter)",
    fontSize: "var(--fs-body)",
    fontWeight: "var(--fw-default)",
    color: "var(--mt-text-primary)",
    outline: "2px solid transparent",
    outlineOffset: 0,
    transition: "box-shadow var(--mt-duration-fast) ease",

    "&:hover:not(.Mui-disabled):not(.Mui-error):not(.Mui-focused)": {
      backgroundColor: "var(--mt-surface)",
      boxShadow: "inset 0 0 0 1px var(--gray-400)",
    },
    "&.Mui-focused": {
      backgroundColor: "var(--mt-surface)",
      boxShadow: "none",
    },
    "&:not(.Mui-disabled):has(:focus-visible), &:not(.Mui-disabled):has(.Mui-focusVisible)": {
      outlineColor: "var(--mt-medview-accent)",
    },
    "&.Mui-error": {
      backgroundColor: "var(--mt-surface)",
      boxShadow: "inset 0 0 0 1px var(--text-error)",
    },
    "&.Mui-disabled": {
      backgroundColor: "var(--mt-surface-subtle)",
      color: "var(--mt-text-tertiary)",
      boxShadow: "none",
      outlineColor: "transparent",
    },
  },
  "& .MuiInputLabel-filled": {
    color: "var(--mt-text-secondary)",
    fontFamily: "var(--inter)",
    fontSize: "var(--fs-body)",
    fontWeight: "var(--fw-default)",
    "&.Mui-focused": {
      color: "var(--mt-text-secondary)",
    },
    "&.Mui-error": {
      color: "var(--text-error)",
    },
    "&.Mui-disabled": {
      color: "var(--mt-text-tertiary)",
    },
  },
  "& .MuiFilledInput-input, & .MuiPickersFilledInput-root .MuiPickersInputBase-sectionsContainer": {
    fontFamily: "inherit",
    fontWeight: "var(--fw-semibold)",
    color: "var(--mt-text-primary)",
    "&::placeholder": {
      color:
        "color-mix(in srgb, var(--mt-text-secondary) 75%, var(--mt-text-tertiary))",
      fontWeight: "var(--fw-default)",
      opacity: 1,
    },
  },
  "& .MuiPickersFilledInput-root:not(.Mui-disabled) .MuiPickersSectionList-sectionContent:not([aria-valuenow])": {
    color:
      "color-mix(in srgb, var(--mt-text-secondary) 75%, var(--mt-text-tertiary))",
    fontWeight: "var(--fw-default)",
  },
  "& .MuiFilledInput-root .MuiAutocomplete-tag": {
    color: "var(--mt-text-primary)",
    fontWeight: "var(--fw-semibold)",
    maxWidth: "100%",
    height: "auto",
    "& .MuiChip-label": {
      whiteSpace: "normal",
      overflowWrap: "anywhere",
      paddingBlock: "var(--mt-space-1)",
    },
    "& .MuiChip-deleteIcon": {
      flexShrink: 0,
    },
  },
  "& .MuiFilledInput-root.Mui-disabled .MuiFilledInput-input, & .MuiPickersFilledInput-root.Mui-disabled .MuiPickersInputBase-sectionsContainer, & .MuiFilledInput-root.Mui-disabled .MuiAutocomplete-tag": {
    color: "var(--mt-text-tertiary)",
    WebkitTextFillColor: "var(--mt-text-tertiary)",
    "&::placeholder": {
      color: "var(--mt-text-tertiary)",
    },
  },
  "& .MuiFilledInput-root .MuiSelect-select:focus": {
    backgroundColor: "transparent",
  },
};
