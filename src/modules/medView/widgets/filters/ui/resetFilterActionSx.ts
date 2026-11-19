export const resetFilterActionSx = {
  borderRadius: "var(--radius-l)",
  backgroundColor: "transparent",
  color: "var(--mt-text-secondary)",
  "&:hover": {
    backgroundColor: "var(--mt-canvas)",
    color: "var(--mt-text-primary)",
  },
  "&.Mui-focusVisible": {
    outline: "2px solid var(--mt-text-secondary)",
    outlineOffset: "2px",
  },
  "&.Mui-disabled": {
    color: "var(--mt-text-tertiary)",
  },
} as const;
