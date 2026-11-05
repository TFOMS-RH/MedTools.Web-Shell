import { medToolsButtonSx } from "../../../../shared/sxConfigs/medToolsButtonSx";
import { medViewDefaultInputSx } from "../../../../shared/sxConfigs/medViewDefaultInputSx";

// Reuse platform controls; only HealthTrack's accent and compact sizing are local.
export const documentInputSx = {
  ...medViewDefaultInputSx,
  "& .MuiFilledInput-root": {
    fontSize: "var(--mt-font-body)",
    "&:not(.Mui-disabled):has(:focus-visible)": { outlineColor: "var(--mt-healthtrack-accent)" },
  },
};

export const documentButtonSx = {
  ...medToolsButtonSx,
  minHeight: 40,
  borderRadius: "var(--mt-radius-control)",
  fontSize: "var(--mt-font-body)",
  fontWeight: "var(--fw-semibold)",
  padding: "8px 16px",
  color: "var(--mt-text-primary)",
  "&:hover": { backgroundColor: "var(--mt-surface-subtle)", borderColor: "var(--border-hover)", boxShadow: "none" },
  "&.MuiButton-contained": {
    // A slightly darker token-based shade keeps white button text above 4.5:1.
    backgroundColor: "color-mix(in srgb, var(--mt-healthtrack-accent) 90%, var(--mt-text-primary))",
    color: "var(--mt-surface)",
    border: 0,
    "&:hover": { backgroundColor: "color-mix(in srgb, var(--mt-healthtrack-accent) 80%, var(--mt-text-primary))" },
  },
  "&.Mui-focusVisible": { outline: "2px solid var(--mt-healthtrack-accent)", outlineOffset: 2 },
  "&.Mui-disabled": {
    opacity: 0.5,
    color: "var(--mt-text-secondary)",
    borderColor: "var(--mt-surface-subtle)",
    backgroundColor: "var(--mt-surface-subtle)",
  },
};
