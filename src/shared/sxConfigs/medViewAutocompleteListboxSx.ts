export const medViewAutocompleteListboxSx = {
  padding: "var(--mt-space-2)",
  maxHeight: "min(24rem, calc(100dvh - 2 * var(--mt-space-12)))",
  "& .MuiAutocomplete-option": {
    borderRadius: "var(--mt-radius-control)",
    fontFamily: "var(--inter)",
    fontSize: "var(--mt-font-body)",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    alignItems: "flex-start",
    "&.Mui-focused, &:hover": { backgroundColor: "var(--mt-surface-subtle)" },
    '&[aria-selected="true"], &[aria-selected="true"].Mui-focused, &[aria-selected="true"]:hover': {
      backgroundColor: "var(--mt-medview-cover)",
    },
    "&.Mui-focusVisible": {
      outline: "2px solid var(--mt-medview-accent)",
      outlineOffset: "-2px",
    },
  },
};
