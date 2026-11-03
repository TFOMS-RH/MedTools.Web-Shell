import { useState } from "react";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

import { useHTNotify } from "../../../hooks/useHTNotify";
import { downloadBlob } from "../../../utils/downloadBlob";
import { useAuthStore } from "../../../../auth/stores/authStore";

import styles from "./styles.module.scss";

export const HTDocumentsAggregation = () => {
  const notify = useHTNotify();
  
  //const organizationType = useAuthStore((state) => state.organizationType);
  const organizationCode = useAuthStore((state) => state.organizationCode);
  
  const isAdmin = organizationCode === "19000";
  const isSmo = organizationCode === "19001" || organizationCode === "19006";
  const isMo = !isAdmin && !isSmo; // Если не админ и не СМО, значит это МО

  // ==========================================
  // Состояния для GST / GPT / GF / PF
  // ==========================================
  const [gstPeriod, setGstPeriod] = useState("");
  const [gstMoCode, setGstMoCode] = useState("");

  const [gptPeriod, setGptPeriod] = useState("");
  const [gptMoCode, setGptMoCode] = useState("");

  const [gfPeriod, setGfPeriod] = useState("");
  const [gfMoCode, setGfMoCode] = useState("");
  const [gfFileNumber, setGfFileNumber] = useState("1");

  const [pfPeriod, setPfPeriod] = useState("");
  const [pfMoCode, setPfMoCode] = useState("");

  // ==========================================
  // Состояния для DSPN -> СМО
  // ==========================================
  const [dspnPeriod, setDspnPeriod] = useState("");
  const [smoCodeForDspn, setSmoCodeForDspn] = useState("");

  // ==========================================
  // Состояния для PROF -> СМО
  // ==========================================
  const [profPeriod, setProfPeriod] = useState("");
  const [smoCodeForProf, setSmoCodeForProf] = useState("");

  // Общий стейт загрузки
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  // ==========================================
  // Универсальный метод скачивания
  // ==========================================
  const downloadFile = async (
    formKey: string,
    url: string,
    fallbackName: string,
  ) => {
    setLoadingKey(formKey);
    try {
      const result = await downloadBlob({
        url,
        fallbackFileName: fallbackName,
      });

      if (result.success) {
        notify.success(`Файл ${result.fileName ?? fallbackName} скачан`);
      } else {
        notify.error(result.errorMessage ?? "Ошибка скачивания файла");
      }
    } finally {
      setLoadingKey(null);
    }
  };

  // ==========================================
  // Обработчики экспорта (GST/GPT/GF/PF)
  // ==========================================
  const handleExportGst = () => {
    if (!gstPeriod) return;
    const params = new URLSearchParams({ period: gstPeriod });
    if (gstMoCode.trim()) params.set("moCode", gstMoCode.trim());
    downloadFile(
      "gst",
      `/health-track/export/gst/aggregated?${params.toString()}`,
      `GST_${gstPeriod.replace("-", "")}.zip`,
    );
  };

  const handleExportGpt = () => {
    if (!gptPeriod) return;
    const params = new URLSearchParams({ period: gptPeriod });
    if (gptMoCode.trim()) params.set("moCode", gptMoCode.trim());
    downloadFile(
      "gpt",
      `/health-track/export/gpt/aggregated?${params.toString()}`,
      `GPT_${gptPeriod.replace("-", "")}.zip`,
    );
  };

  const handleExportGf = () => {
    if (!gfPeriod) return;
    const moCode = gfMoCode.trim() || "";
    if (!moCode) {
      notify.warning("Укажите код МО — он обязателен для экспорта GF");
      return;
    }

    const params = new URLSearchParams({
      period: gfPeriod,
      moCode,
      fileNumber: gfFileNumber || "1",
    });
    downloadFile(
      "gf",
      `/health-track/export/gf?${params.toString()}`,
      `GF${moCode}_${gfPeriod.replace("-", "")}.zip`,
    );
  };

  const handleExportPf = () => {
    if (!pfPeriod) return;
    const params = new URLSearchParams({ period: pfPeriod });
    if (pfMoCode.trim()) params.set("moCode", pfMoCode.trim());
    downloadFile(
      "pf",
      `/health-track/export/pf/aggregated?${params.toString()}`,
      `PF_${pfPeriod.replace("-", "")}.zip`,
    );
  };

  // ==========================================
  // Обработчик экспорта DSPN -> СМО
  // ==========================================
  const handleExportDspnToSmo = async () => {
    if (!dspnPeriod.trim()) {
      notify.warning("Укажите период");
      return;
    }
    if (isAdmin && !smoCodeForDspn.trim()) {
      notify.warning("Укажите код СМО");
      return;
    }

    setLoadingKey("dspn-smo");
    try {
      const params = new URLSearchParams({ period: dspnPeriod.trim() });
      
      if (isAdmin && smoCodeForDspn.trim()) {
        params.set("smoCode", smoCodeForDspn.trim());
      }

      const url = `/health-track/export/dspn/to-smo?${params.toString()}`;

      const result = await downloadBlob({
        url,
        fallbackFileName: `DSPN_SMO_${dspnPeriod}.zip`,
      });

      if (result.success) {
        notify.success("Файл успешно выгружен");
      } else {
        notify.error(result.errorMessage ?? "Ошибка выгрузки");
      }
    } finally {
      setLoadingKey(null);
    }
  };

  // ==========================================
  // Обработчик экспорта PROF -> СМО
  // ==========================================
  const handleExportProfToSmo = async () => {
    if (!profPeriod.trim()) {
      notify.warning("Укажите период");
      return;
    }
    if (isAdmin && !smoCodeForProf.trim()) {
      notify.warning("Укажите код СМО");
      return;
    }

    setLoadingKey("prof-smo");
    try {
      const params = new URLSearchParams({ period: profPeriod.trim() });
      
      if (isAdmin && smoCodeForProf.trim()) {
        params.set("smoCode", smoCodeForProf.trim());
      }

      const url = `/health-track/export/prof/to-smo?${params.toString()}`;

      const result = await downloadBlob({
        url,
        fallbackFileName: `PROF_SMO_${profPeriod}.zip`,
      });

      if (result.success) {
        notify.success("Файл успешно выгружен");
      } else {
        notify.error(result.errorMessage ?? "Ошибка выгрузки");
      }
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <section className={styles.aggregationRoot}>
      {/* Заголовок */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <LayersOutlinedIcon sx={{ fontSize: 22, color: "var(--text-default)" }} />
          <h3 className={styles.title}>Агрегация данных</h3>
        </div>
        <p className={styles.subtitle}>Формирование сводных файлов для ГИС ОМС</p>
      </header>


      {/* Верхняя строка — агрегация */}
      <div className={styles.gridRow}>
        {isAdmin && (
          <div className={styles.formCard}>         
            <h4 className={styles.formTitle}>GST (GSM→GST):</h4>
            
            <div className={styles.inlineField}>
              <input
                className={styles.compactInput}
                type="text"
                placeholder="Все периоды"
                value={gstPeriod}
                onChange={(e) => setGstPeriod(e.currentTarget.value)}
              />
            </div>
            
            <div className={styles.inlineField}>
              <input
                className={styles.compactInput}
                type="text"
                placeholder="Все МО"
                value={gstMoCode}
                onChange={(e) => setGstMoCode(e.currentTarget.value)}
              />
              <button
                type="button"
                className={styles.exportBtn}
                onClick={handleExportGst}
                disabled={!gstPeriod || loadingKey === "gst"}
              >
                <CloudDownloadIcon sx={{ fontSize: 16 }} />
                {loadingKey === "gst" ? "…" : "Выгрузить"}
              </button>
            </div>
        </div>
        )}

        {isAdmin && (
          <div className={styles.formCard}>
            <h4 className={styles.formTitle}>GPT (GPM→GPT):</h4>
            <div className={styles.inlineField}>
              <input
                className={styles.compactInput}
                type="text"
                placeholder="Все периоды"
                value={gptPeriod}
                onChange={(e) => setGptPeriod(e.currentTarget.value)}
              />
            </div>
            <div className={styles.inlineField}>
              <input
                className={styles.compactInput}
                type="text"
                placeholder="Все МО"
                value={gptMoCode}
                onChange={(e) => setGptMoCode(e.currentTarget.value)}
              />
              <button
                type="button"
                className={styles.exportBtn}
                onClick={handleExportGpt}
                disabled={!gptPeriod || loadingKey === "gpt"}
              >
                <CloudDownloadIcon sx={{ fontSize: 16 }} />
                {loadingKey === "gpt" ? "…" : "Выгрузить"}
              </button>
            </div>
          </div>
        )}

        {!isSmo && (
          <div className={styles.formCard}>
            <h4 className={styles.formTitle}>GF:</h4>
            <div className={styles.inlineField}>
              <input
                className={styles.compactInput}
                type="text"
                placeholder="Все периоды"
                value={gfPeriod}
                onChange={(e) => setGfPeriod(e.currentTarget.value)}
              />
            </div>
            <div className={styles.inlineField}>
              <input
                className={styles.compactInput}
                type="text"
                placeholder="Все МО"
                value={gfMoCode}
                onChange={(e) => setGfMoCode(e.currentTarget.value)}
              />
              <input
                className={`${styles.compactInput} ${styles.fileNumber}`}
                type="text"
                placeholder="Пакет"
                value={gfFileNumber}
                onChange={(e) => setGfFileNumber(e.currentTarget.value)}
              />
              <button
                type="button"
                className={styles.exportBtn}
                onClick={handleExportGf}
                disabled={!gfPeriod || loadingKey === "gf"}
              >
                <CloudDownloadIcon sx={{ fontSize: 16 }} />
                {loadingKey === "gf" ? "…" : "Выгрузить"}
              </button>
            </div>
          </div>
        )}

        {!isSmo && (
          <div className={styles.formCard}>
            <h4 className={styles.formTitle}>PF:</h4>
            <div className={styles.inlineField}>
              <input
                className={styles.compactInput}
                type="text"
                placeholder="Все периоды"
                value={pfPeriod}
                onChange={(e) => setPfPeriod(e.currentTarget.value)}
              />
            </div>
            <div className={styles.inlineField}>
              <input
                className={styles.compactInput}
                type="text"
                placeholder="Все МО"
                value={pfMoCode}
                onChange={(e) => setPfMoCode(e.currentTarget.value)}
              />
              <button
                type="button"
                className={styles.exportBtn}
                onClick={handleExportPf}
                disabled={!pfPeriod || loadingKey === "pf"}
              >
                <CloudDownloadIcon sx={{ fontSize: 16 }} />
                {loadingKey === "pf" ? "…" : "Выгрузить"}
              </button>
            </div>
          </div>
        )}
      </div>
        

      {/* ============================== */}
      {/* Нижняя строка — DSPN/PROF для СМО */}
      {/* ============================== */}
      <div className={styles.gridRow}>
        {/* DSPN → СМО */}
        {!isMo && (
          <div className={styles.formCard}>
            <h4 className={styles.formTitle}>DSPN → СМО:</h4>
            
            <div className={styles.inlineField}>
              <input
                className={styles.compactInput}
                type="text"
                placeholder="Период (ГГГГ-ММ)"
                value={dspnPeriod}
                onChange={(e) => setDspnPeriod(e.currentTarget.value)}
                disabled={loadingKey === "dspn-smo"}
              />
            </div>

            {isAdmin && (
              <div className={styles.inlineField}>
                <input
                  className={styles.compactInput}
                  type="text"
                  placeholder="Код СМО (например, 19001)"
                  value={smoCodeForDspn}
                  onChange={(e) => setSmoCodeForDspn(e.currentTarget.value)}
                  disabled={loadingKey === "dspn-smo"}
                />
              </div>
            )}

            <div className={styles.inlineField}>
              <button
                type="button"
                className={styles.exportBtn}
                onClick={handleExportDspnToSmo}
                disabled={
                  !dspnPeriod.trim() || 
                  loadingKey === "dspn-smo" || 
                  (isAdmin && !smoCodeForDspn.trim())
                }
              >
                <CloudDownloadIcon sx={{ fontSize: 16 }} />
                {loadingKey === "dspn-smo" ? "…" : "Выгрузить для СМО"}
              </button>
            </div>
          </div>
        )}

        {/* PROF → СМО */}
        {!isMo && (
          <div className={styles.formCard}>
            <h4 className={styles.formTitle}>PROF → СМО:</h4>
            
            <div className={styles.inlineField}>
              <input
                className={styles.compactInput}
                type="text"
                placeholder="Период (ГГГГ-ММ)"
                value={profPeriod}
                onChange={(e) => setProfPeriod(e.currentTarget.value)}
                disabled={loadingKey === "prof-smo"}
              />
            </div>

            {isAdmin && (
              <div className={styles.inlineField}>
                <input
                  className={styles.compactInput}
                  type="text"
                  placeholder="Код СМО (например, 19001)"
                  value={smoCodeForProf}
                  onChange={(e) => setSmoCodeForProf(e.currentTarget.value)}
                  disabled={loadingKey === "prof-smo"}
                />
              </div>
            )}

            <div className={styles.inlineField}>
              <button
                type="button"
                className={styles.exportBtn}
                onClick={handleExportProfToSmo}
                disabled={
                  !profPeriod.trim() || 
                  loadingKey === "prof-smo" || 
                  (isAdmin && !smoCodeForProf.trim())
                }
              >
                <CloudDownloadIcon sx={{ fontSize: 16 }} />
                {loadingKey === "prof-smo" ? "…" : "Выгрузить для СМО"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};