import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";
import { medViewSelectInputSx } from "../../../../sxConfigs/medViewSelectInput";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { medViewAutocompleteListboxSx } from "../../../../sxConfigs/medViewAutocompleteListboxSx";
import type { FilterOption } from "../../../../../modules/medView/widgets/workspace/model/types/FilterOptions";
import { medViewPopupSx } from "../../../../sxConfigs/medViewPopupSx";

interface MedViewAutocompleteInputProps {
  label: string;
  values: FilterOption[];
  options: FilterOption[];
  inputValue: string;

  onInputChange: (value: string) => void;
  onChange: (values: FilterOption[]) => void;

  loading?: boolean;
  limitTags?: number;
}

export const MedViewAutocompleteInput = ({
  label,
  values,
  options,
  inputValue,
  onInputChange,
  onChange,
  loading,
  limitTags = 3,
}: MedViewAutocompleteInputProps) => {
  return (
    <Autocomplete
      size="small"
      multiple
      limitTags={limitTags}
      options={options}
      value={values}
      inputValue={inputValue}
      disableCloseOnSelect
      onInputChange={(_, newValue) => onInputChange(newValue)}
      onChange={(_, newValues) => onChange(newValues)}
      getOptionLabel={(option) => option.label}
      filterOptions={(options) => options}
      loading={loading}
      loadingText="Подтягиваем данные ..."
      noOptionsText="Нет доступных опций"
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          label={label}
          slotProps={{
            ...params.slotProps,
            inputLabel: { ...params.slotProps.inputLabel, shrink: true },
            htmlInput: {
              ...params.slotProps.htmlInput,
              "aria-busy": loading || undefined,
            },
            input: {
              ...params.slotProps.input,
              disableUnderline: true,
              endAdornment: loading ? (
                <Box
                  sx={{
                    position: "absolute",
                    right: "var(--mt-space-2)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--mt-space-1)",
                    "& .MuiAutocomplete-endAdornment": {
                      position: "static",
                      transform: "none",
                    },
                  }}
                >
                  <CircularProgress
                    size={16}
                    aria-label="Загрузка вариантов"
                    sx={{ color: "var(--mt-medview-accent)" }}
                  />
                  {params.slotProps.input.endAdornment}
                </Box>
              ) : params.slotProps.input.endAdornment,
            },
          }}
        />
      )}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        const SelectedIcon = selected ? CheckBoxIcon : CheckBoxOutlineBlankIcon;

        return (
          <li key={key} {...optionProps}>
            <SelectedIcon
              fontSize="small"
              sx={{ flexShrink: 0, marginRight: "var(--mt-space-2)" }}
            />
            {option.label}
          </li>
        );
      }}
      sx={[
        medViewSelectInputSx,
        {
          minWidth: 0,
          "& .MuiInputLabel-filled.MuiInputLabel-shrink": {
            maxWidth: loading
              ? "calc((100% - var(--mt-space-12) - var(--mt-space-10)) / 0.75)"
              : "calc((100% - var(--mt-space-12) - var(--mt-space-4)) / 0.75)",
          },
          // Override MUI's combined clear/popup icon spacing while loading.
          "&& .MuiFilledInput-root.MuiInputBase-sizeSmall.MuiAutocomplete-inputRoot": {
            ...(loading
              ? { paddingRight: "calc(var(--mt-space-12) + var(--mt-space-10))" }
              : {}),
          },
        },
      ]}
      slotProps={{
        paper: { sx: medViewPopupSx },
        listbox: {
          sx: medViewAutocompleteListboxSx,
        },
      }}
    />
  );
};
