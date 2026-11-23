import type { FilterOption } from "../../../../../modules/medView/widgets/workspace/model/types/FilterOptions";
import { useId, useRef } from "react";
import MenuItem from "@mui/material/MenuItem";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Box,
  Chip,
  FormControl,
  IconButton,
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
  const selectRef = useRef<{ focus: () => void }>(null);

  const handleChange = (event: SelectChangeEvent<typeof values>) => {
    const {
      target: { value },
    } = event;

    onChange(typeof value === "string" ? value.split(",") : value);
  };

  const removeValue = (value: string) => {
    selectRef.current?.focus();
    onChange(values.filter((selected) => selected !== value));
  };

  return (
    <Box>
      <FormControl
        variant="filled"
        size="small"
        fullWidth
        sx={[
          medViewSelectInputSx,
          {
            "& .MuiFilledInput-root .MuiSelect-select .MuiChip-root .MuiChip-label": {
              display: "flex",
              alignItems: "center",
              gap: "var(--mt-space-1)",
              paddingBlock: 0,
              paddingInlineEnd: "var(--mt-space-1)",
            },
          },
        ]}
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
          inputRef={selectRef}
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

            const labelsByValue = new Map(
              options.map(({ value, label }) => [value, label]),
            );

            return (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--mt-space-1)",
                }}
              >
                {selected.map((value) => {
                  const optionLabel = labelsByValue.get(value) || value;

                  return (
                    <Chip
                      key={value}
                      size="small"
                      label={
                        <>
                          <span>{optionLabel}</span>
                          <IconButton
                            type="button"
                            size="small"
                            aria-label={`Убрать «${optionLabel}»`}
                            disableRipple
                            onMouseDown={(event) => event.stopPropagation()}
                            onKeyDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation();
                              removeValue(value);
                            }}
                            sx={{
                              width: "var(--mt-space-6)",
                              height: "var(--mt-space-6)",
                              flexShrink: 0,
                              color: "var(--mt-text-secondary)",
                              "&:hover": { color: "var(--mt-text-primary)" },
                              "&.Mui-focusVisible": {
                                outline: "2px solid var(--mt-medview-accent)",
                                outlineOffset: "-2px",
                              },
                            }}
                          >
                            <CancelIcon fontSize="inherit" />
                          </IconButton>
                        </>
                      }
                    />
                  );
                })}
              </Box>
            );
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
