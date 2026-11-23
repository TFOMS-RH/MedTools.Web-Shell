import { Box, FormControl, InputLabel, Select } from "@mui/material";
import { useId } from "react";
import { medViewSelectInputSx } from "../../../../sxConfigs/medViewSelectInput";
import MenuItem from "@mui/material/MenuItem";
import { medViewSelectMenuSx } from "../../../../sxConfigs/medViewSelectMenuSx";

const emptySelectionLabel = "Не выбрано";

type Option<T extends string> = {
  label: string;
  value: T;
};

type MedViewSelectInputProps<T extends string> = {
  options: Option<T>[];
  label: string;
  value: T | "";
  onChange: (value: T) => void;
  onClear?: () => void;
};

export function MedViewSelectInput<T extends string>({
  options,
  label,
  value,
  onChange,
  onClear,
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
        <Select<T | "">
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
                  {emptySelectionLabel}
                </span>
              );
            }

            const displayValue = options.find((x) => x.value === selected)?.label || selected;
            return <span title={displayValue}>{displayValue}</span>;
          }}
          value={value}
          onChange={(event) => {
            const selected = event.target.value;
            if (selected === "") {
              onClear?.();
              return;
            }

            const option = options.find((item) => item.value === selected);
            if (option) onChange(option.value);
          }}
          label={label}
          MenuProps={{ slotProps: { paper: { sx: medViewSelectMenuSx } } }}
        >
          {onClear && (
            <MenuItem value="" sx={{ color: "var(--mt-text-secondary)" }}>
              {emptySelectionLabel}
            </MenuItem>
          )}
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
