import type React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { medToolsToggleSx } from "../../../sxConfigs/medToolsToggleSx";

interface MedicalRegisterTypeToggleProps {
  value: string;
  labels?: { internal: string; interterritorial: string };
  "aria-labelledby"?: string;
  onChange: (event: React.MouseEvent<HTMLElement>, newAligment: string) => void;
}

export const MedicalRegisterTypeToggle = ({
  value,
  labels,
  "aria-labelledby": labelledBy,
  onChange,
}: MedicalRegisterTypeToggleProps) => {
  return (
    <ToggleButtonGroup
      size="small"
      value={value}
      exclusive
      onChange={onChange}
      aria-label={labelledBy ? undefined : "Database type"}
      aria-labelledby={labelledBy}
      sx={medToolsToggleSx}
    >
      <ToggleButton value="Internal">{labels?.internal ?? "СМО РХ"}</ToggleButton>
      <ToggleButton value="Interterritorial">{labels?.interterritorial ?? "Иногород"}</ToggleButton>
    </ToggleButtonGroup>
  );
};
