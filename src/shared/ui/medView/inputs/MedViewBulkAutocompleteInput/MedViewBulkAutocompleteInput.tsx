import { Autocomplete, TextField, Chip } from "@mui/material";
import { useMedViewFilterSearch } from "../filterInputReset";
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

const maxUid = 2_147_483_647;

const parseUid = (token: string): number | null => {
  if (!/^[0-9]+$/.test(token)) return null;

  const uid = Number(token);
  return uid > 0 && uid <= maxUid ? uid : null;
};

type MedViewBulkAutocompleteInputProps = {
  label?: string;
  placeholder?: string;
} & (
  | { mode?: "text"; value: string[]; onChange: (values: string[]) => void }
  | { mode: "uid"; value: number[]; onChange: (values: number[]) => void }
);

export const MedViewBulkAutocompleteInput = (
  props: MedViewBulkAutocompleteInputProps,
) => {
  const { label, placeholder } = props;
  const isUid = props.mode === "uid";
  const value = props.mode === "uid" ? props.value.map(String) : props.value;
  const [inputValue, setInputValue] = useMedViewFilterSearch();
  const [rejectedValues, setRejectedValues] = useMedViewFilterSearch();

  const inputError =
    isUid && inputValue !== "" && parseUid(inputValue) === null
      ? "Введите целый UID от 1 до 2 147 483 647"
      : rejectedValues;

  const updateValues = (tokens: string[]) => {
    if (props.mode === "uid") {
      const numbers = tokens.map(parseUid).filter((uid) => uid !== null);
      setRejectedValues(
        numbers.length === tokens.length ? "" : "Некорректные UID пропущены",
      );
      props.onChange(Array.from(new Set(numbers)));
      return;
    }

    props.onChange(Array.from(new Set(tokens)));
  };

  const commitInput = (input: string) => {
    updateValues([...value, ...parseValues(input)]);
    setInputValue("");
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData("text");
    if (!HAS_SEPARATOR.test(text)) return;

    event.preventDefault();
    commitInput(isUid ? `${inputValue}\n${text}` : text);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const isCommitKey =
      event.key === "Enter" ||
      event.key === "," ||
      event.key === ";" ||
      (!isUid && event.key === "Tab");

    if (!isCommitKey || !inputValue.trim()) return;

    event.preventDefault();
    if (isUid) event.stopPropagation();
    commitInput(inputValue);
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
      onBlur={(event) => {
        if (
          isUid &&
          !event.currentTarget.contains(event.relatedTarget) &&
          inputValue.trim()
        ) {
          commitInput(inputValue);
        }
      }}
      onInputChange={(_, text, reason) => {
        if (reason !== "input") return;
        if (HAS_SEPARATOR.test(text)) {
          commitInput(text);
        } else {
          setInputValue(text);
          if (rejectedValues) setRejectedValues("");
        }
      }}
      onChange={(_, newValues) => updateValues(newValues.flatMap(parseValues))}
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
          error={Boolean(inputError)}
          helperText={inputError || undefined}
          slotProps={{
            ...params.slotProps,
            inputLabel: { ...params.slotProps.inputLabel, shrink: true },
            htmlInput: {
              ...params.slotProps.htmlInput,
              inputMode: isUid ? "numeric" : undefined,
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
