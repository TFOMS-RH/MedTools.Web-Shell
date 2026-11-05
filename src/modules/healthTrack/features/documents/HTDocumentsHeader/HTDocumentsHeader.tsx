import RefreshIcon from "@mui/icons-material/Refresh";
import { Button } from "@mui/material";
import { documentButtonSx } from "../controlsSx";
import styles from "./styles.module.scss";

interface HTDocumentsHeaderProps {
  totalCount: number;
  showCount: boolean;
  onRefresh: () => void;
  isLoading: boolean;
}

export const HTDocumentsHeader = ({ totalCount, showCount, onRefresh, isLoading }: HTDocumentsHeaderProps) => (
  <header className={styles.headerRoot}>
    <h2 id="ht-documents-heading" className={styles.title}>Документы</h2>
    <div className={styles.actions}>
      {showCount && <span>Найдено: <strong>{totalCount.toLocaleString("ru-RU")}</strong></span>}
      <Button sx={documentButtonSx} variant="outlined" size="small" onClick={onRefresh} disabled={isLoading} startIcon={<RefreshIcon fontSize="small" />}>
        Обновить
      </Button>
    </div>
  </header>
);
