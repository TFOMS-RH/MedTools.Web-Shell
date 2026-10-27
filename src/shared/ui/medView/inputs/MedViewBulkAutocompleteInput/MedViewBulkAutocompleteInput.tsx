import { Autocomplete, TextField, Chip } from "@mui/material";
import { useState, useCallback } from "react";
import { medViewSelectInputSx } from "../../../../sxConfigs/medViewSelectInput";
import { medViewPopupSx } from "../../../../sxConfigs/medViewPopupSx";
import { medViewAutocompleteListboxSx } from "../../../../sxConfigs/medViewAutocompleteListboxSx";

const SEPARATORS = /[;,\n\s]+/;
const HAS_SEPARATOR = /[;,\n\s]/;

const parseValues = (input: string): string[] =>
  input
    .split(SEPARATORS)
    .map((v) => v.trim())
    .filter(Boolean);

const uniqueValues = (input: string[]): string[] => Array.from(new Set(input));

interface MedViewBulkAutocompleteInputProps {
  value: string[];
  onChange: (values: string[]) => void;
  label?: string;
  placeholder?: string;
}

export const MedViewBulkAutocompleteInput = ({
  value,
  onChange,
  label,
  placeholder,
}: MedViewBulkAutocompleteInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const mergeValues = useCallback(
    (incoming: string[]) => {
      onChange(uniqueValues([...value, ...incoming]));
    },
    [value, onChange],
  );

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData("text");
    if (!HAS_SEPARATOR.test(text)) return;

    event.preventDefault();
    mergeValues(parseValues(text));
    setInputValue("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key === "Enter" ||
      event.key === "Tab" ||
      event.key === "," ||
      event.key === ";"
    ) {
      if (inputValue.trim()) {
        event.preventDefault();
        mergeValues(parseValues(inputValue));
        setInputValue("");
      }
    }
  };

  return (
    <Autocomplete<string, true, false, true>
      size="small"
      multiple
      freeSolo
      disableCloseOnSelect
      options={[]}
      value={value}
      inputValue={inputValue}
      onInputChange={(_, value, reason) => {
        if (reason !== "input") return;
        if (HAS_SEPARATOR.test(value)) {
          mergeValues(parseValues(value));
          setInputValue("");
        } else {
          setInputValue(value);
        }
      }}
      onChange={(_, newValues) => {
        onChange(uniqueValues(newValues.flatMap(parseValues)));
      }}
      renderValue={(tagValues, getItemProps) =>
        tagValues.map((option, index) => {
          const { key, ...tagProps } = getItemProps({ index });
          return <Chip key={key} label={option} size="small" {...tagProps} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          label={label}
          placeholder={placeholder}
          slotProps={{
            ...params.slotProps,
            inputLabel: { ...params.slotProps.inputLabel, shrink: true },
            htmlInput: {
              ...params.slotProps.htmlInput,
              "aria-busy": undefined,
            },
            input: {
              ...params.slotProps.input,
              disableUnderline: true,
            },
          }}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
        />
      )}
      sx={[
        medViewSelectInputSx,
        {
          minWidth: 0,
          "& .MuiInputLabel-filled.MuiInputLabel-shrink": {
            maxWidth:
              "calc((100% - var(--mt-space-12) - var(--mt-space-4)) / 0.75)",
          },
        },
      ]}
      slotProps={{
        paper: { sx: medViewPopupSx },
        listbox: { sx: medViewAutocompleteListboxSx },
      }}
    />
  );
};
