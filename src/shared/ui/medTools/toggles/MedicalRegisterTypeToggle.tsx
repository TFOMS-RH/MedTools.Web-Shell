import type React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { medToolsToggleSx } from "../../../sxConfigs/medToolsToggleSx";

interface MedicalRegisterTypeToggleProps {
  value: string;
  onChange: (event: React.MouseEvent<HTMLElement>, newAligment: string) => void;
}

export const MedicalRegisterTypeToggle = ({
  value,
  onChange,
}: MedicalRegisterTypeToggleProps) => {
  return (
    <ToggleButtonGroup
      size="small"
      value={value}
      exclusive
      onChange={onChange}
      aria-label="Database type"
      sx={medToolsToggleSx}
    >
      <ToggleButton value="Internal">СМО РХ</ToggleButton>
      <ToggleButton value="Interterritorial">Иногород</ToggleButton>
    </ToggleButtonGroup>
  );
};
