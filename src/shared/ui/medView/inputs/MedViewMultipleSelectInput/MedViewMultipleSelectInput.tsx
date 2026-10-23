import type { FilterOption } from "../../../../../modules/medView/widgets/workspace/model/types/FilterOptions";
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
  const handleChange = (event: SelectChangeEvent<typeof values>) => {
    const {
      target: { value },
    } = event;

    onChange(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <Box>
      <FormControl size="small" fullWidth sx={medViewSelectInputSx}>
        <InputLabel
          sx={{
            fontFamily: "var(--inter)",
          }}
        >
          {label}
        </InputLabel>
        <Select
          multiple
          value={values}
          onChange={handleChange}
          label={label}
          renderValue={(selected) => {
            return options
              .filter((x) => selected.includes(x.value))
              .map((x) => x.label)
              .join(", ");
          }}
          MenuProps={{
            slotProps: {
              paper: {
                style: {
                  maxHeight: 500,
                  width: 250,
                },
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
                    style={{ boxSizing: "content-box", marginRight: 8 }}
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
