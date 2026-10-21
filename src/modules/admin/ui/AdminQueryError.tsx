import { Button } from "@mui/material";
import { getApiError } from "../../../shared/helpers/getApiError";
import { DataState } from "../../../shared/ui/DataState/DataState";
import { medToolsButtonSx } from "../../../shared/sxConfigs/medToolsButtonSx";

export const AdminQueryError = ({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) => {
  const info = getApiError(
    error,
    "Не удалось загрузить данные. Попробуйте ещё раз.",
  );
  return (
    <div role="alert">
      <DataState
        variant="error"
        title={info.status === 403 ? "Нет доступа" : "Ошибка загрузки"}
        description={info.message}
      />
      {info.status !== 403 && info.status !== 401 && (
        <Button sx={medToolsButtonSx} onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  );
};
