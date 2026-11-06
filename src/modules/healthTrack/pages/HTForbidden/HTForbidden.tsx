// ==========================================
// modules/healthTrack/pages/HTForbidden/HTForbidden.tsx
// ==========================================
import { useNavigate } from "react-router";
import Button from "@mui/material/Button";
import { documentButtonSx } from "../../features/documents/controlsSx";
import styles from "./styles.module.scss";

/**
 * Страница 403 — «Доступ запрещён».
 *
 * Рендерится внутри AppLayout Никитки (шапка + подвал остаются).
 * Показывается когда у пользователя нет прав на раздел.
 *
 * Пример: админ попал на страницу только-для-ТФОМС,
 * либо роль не найдена в списке доступных для маршрута.
 */
export const HTForbidden = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.forbiddenRoot}>
      <h1>403</h1>

      <p className={styles.subtitle}>
        У вас нет доступа к этому разделу. Обратитесь к администратору системы.
      </p>

      <Button sx={documentButtonSx}
        variant="outlined"
        size="small"
        onClick={() => navigate("/health-track")}
      >
        На главную
      </Button>
    </section>
  );
};