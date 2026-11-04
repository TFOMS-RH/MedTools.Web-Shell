import { medViewPopupSx } from "./medViewPopupSx";

export const medViewSelectMenuSx = {
  ...medViewPopupSx,
  width: "min(32rem, calc(100vw - 2 * var(--mt-space-4)))",
  maxHeight: "min(31rem, calc(100dvh - 2 * var(--mt-space-4)))",
  "& .MuiMenu-list": { padding: "var(--mt-space-2)" },
  "& .MuiMenuItem-root": {
    borderRadius: "var(--mt-radius-control)",
    fontFamily: "var(--inter)",
    fontSize: "var(--mt-font-body)",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    alignItems: "flex-start",
    "&:hover:not(.Mui-disabled)": { backgroundColor: "var(--mt-surface-subtle)" },
    "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: "var(--mt-medview-cover)" },
    "&.Mui-focusVisible": {
      outline: "2px solid var(--mt-medview-accent)",
      outlineOffset: "-2px",
      backgroundColor: "var(--mt-surface-subtle)",
    },
    "&.Mui-selected.Mui-focusVisible": { backgroundColor: "var(--mt-medview-cover)" },
  },
};
