import type { FilterOption } from "../../../../../modules/medView/widgets/workspace/model/types/FilterOptions";
import { useId } from "react";
import MenuItem from "@mui/material/MenuItem";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { medViewSelectInputSx } from "../../../../sxConfigs/medViewSelectInput";
import { medViewSelectMenuSx } from "../../../../sxConfigs/medViewSelectMenuSx";

interface MedViewMultipleSelectInputProps {
  options: FilterOption[];
  label: string;
  values: string[];
  multiple?: boolean;
  onChange: (value: string[]) => void;
}

export const MedViewMultipleSelectInput = ({
  options,
  label,
  values,
  onChange,
}: MedViewMultipleSelectInputProps) => {
  const labelId = useId();

  const handleChange = (event: SelectChangeEvent<typeof values>) => {
    const {
      target: { value },
    } = event;

    onChange(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <Box>
      <FormControl
        variant="filled"
        size="small"
        fullWidth
        sx={medViewSelectInputSx}
      >
        <InputLabel
          id={labelId}
          shrink
          sx={{
            fontFamily: "var(--inter)",
          }}
        >
          {label}
        </InputLabel>
        <Select
          variant="filled"
          disableUnderline
          labelId={labelId}
          displayEmpty
          multiple
          value={values}
          onChange={handleChange}
          label={label}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return (
                <span
                  style={{
                    color:
                      "color-mix(in srgb, var(--mt-text-secondary) 75%, var(--mt-text-tertiary))",
                    fontWeight: "var(--fw-default)",
                  }}
                >
                  Не выбрано
                </span>
              );
            }

            const knownLabels = options
              .filter((x) => selected.includes(x.value))
              .map((x) => x.label || x.value);
            const missingValues = selected.filter(
              (value) => !options.some((option) => option.value === value),
            );
            const displayValue = [...knownLabels, ...missingValues].join(", ");
            return <span title={displayValue}>{displayValue}</span>;
          }}
          MenuProps={{
            slotProps: {
              paper: {
                sx: medViewSelectMenuSx,
              },
            },
          }}
        >
          {options.length > 0 ? (
            options.map((option) => {
              const selected = values.includes(option.value);
              const SelectionIcon = selected
                ? CheckBoxIcon
                : CheckBoxOutlineBlankIcon;
              return (
                <MenuItem key={option.value} value={option.value}>
                  <SelectionIcon
                    fontSize="small"
                    sx={{ flexShrink: 0, marginRight: "var(--mt-space-2)" }}
                  />
                  {option.label}
                </MenuItem>
              );
            })
          ) : (
            <MenuItem disabled>Нет доступных опций</MenuItem>
          )}
        </Select>
      </FormControl>
    </Box>
  );
};
