import { Box, FormControl, InputLabel, Select } from "@mui/material";
import { useId } from "react";
import { medViewSelectInputSx } from "../../../../sxConfigs/medViewSelectInput";
import MenuItem from "@mui/material/MenuItem";
import { medViewSelectMenuSx } from "../../../../sxConfigs/medViewSelectMenuSx";

type Option<T extends string> = {
  label: string;
  value: T;
};

type MedViewSelectInputProps<T extends string> = {
  options: Option<T | "">[];
  label: string;
  value: string;
  onChange: (value: T) => void;
};

export function MedViewSelectInput<T extends string>({
  options,
  label,
  value,
  onChange,
}: MedViewSelectInputProps<T>) {
  const labelId = useId();

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
          renderValue={(selected) => {
            if (!selected) {
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

            const displayValue = options.find((x) => x.value === selected)?.label || selected;
            return <span title={displayValue}>{displayValue}</span>;
          }}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          label={label}
          MenuProps={{ slotProps: { paper: { sx: medViewSelectMenuSx } } }}
        >
          {options.length > 0 ? (
            options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>Данных не найдено</MenuItem>
          )}
        </Select>
      </FormControl>
    </Box>
  );
}
