import { TextField } from "@mui/material";
import { medViewDefaultInputSx } from "../../../../sxConfigs/medViewDefaultInputSx";

interface MedViewDefaultInputProps {
  label: string;
  placeholder: string;
  fullWidth?: boolean;
  size?: "small" | "medium";
  variant?: "filled" | "outlined" | "standard";
  handleInputChange: (value: string) => void;
  value: string;
}

export const MedViewDefaultInput = ({
  label,
  placeholder,
  fullWidth = true,
  size = "small",
  variant = "filled",
  handleInputChange,
  value,
}: MedViewDefaultInputProps) => {
  return (
    <TextField
      fullWidth={fullWidth}
      label={label}
      placeholder={placeholder}
      size={size}
      variant={variant}
      slotProps={{
        input: variant === "filled" ? { disableUnderline: true } : undefined,
        inputLabel: {
          shrink: true,
        },
      }}
      sx={medViewDefaultInputSx}
      onChange={(event) => handleInputChange(event.target.value)}
      value={value}
    />
  );
};
