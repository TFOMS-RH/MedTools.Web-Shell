import { Button, Tab, Tabs, TextField } from "@mui/material";
import { documentButtonSx, documentInputSx } from "../controlsSx";
import { useId, useState } from "react";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

import { useHTNotify } from "../../../hooks/useHTNotify";
import { downloadBlob } from "../../../utils/downloadBlob";
import { useAuthStore } from "../../../../auth/stores/authStore";

import styles from "./styles.module.scss";

type ExportFormat = "gst" | "gpt" | "gf" | "pf" | "dspn-smo" | "prof-smo";

export const HTDocumentsAggregation = () => {
  const id = useId();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("gst");
  const notify = useHTNotify();

  //const organizationType = useAuthStore((state) => state.organizationType);
  const organizationCode = useAuthStore((state) => state.organizationCode);

  const isAdmin = organizationCode === "19000";
  const isSmo = organizationCode === "19001" || organizationCode === "19006";
  const isMo = !isAdmin && !isSmo; // Если не админ и не СМО, значит это МО
  const formats: { value: ExportFormat; label: string; visible: boolean }[] = [
    { value: "gst", label: "GST", visible: isAdmin },
    { value: "gpt", label: "GPT", visible: isAdmin },
    { value: "gf", label: "GF", visible: !isSmo },
    { value: "pf", label: "PF", visible: !isSmo },
    { value: "dspn-smo", label: "DSPN → СМО", visible: !isMo },
    { value: "prof-smo", label: "PROF → СМО", visible: !isMo },
  ];
  const availableFormats = formats.filter((format) => format.visible);
  const activeFormat = availableFormats.some((format) => format.value === selectedFormat)
    ? selectedFormat : availableFormats[0]?.value;


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
    <section className={styles.aggregationRoot} aria-labelledby="ht-export-heading">
      {/* Заголовок */}
      <header className={styles.header}>
        <h2 id="ht-export-heading" className={styles.title}>Экспорт</h2>
      </header>


      <Tabs className={styles.formatTabs} value={activeFormat ?? false}
        onChange={(_, value: ExportFormat) => setSelectedFormat(value)}
        variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="Формат выгрузки">
        {availableFormats.map((format) => <Tab key={format.value} value={format.value} label={format.label}
          id={id + "-tab-" + format.value} aria-controls={id + "-panel-" + format.value} />)}
      </Tabs>
      <div className={styles.gridRow}>
        {isAdmin && activeFormat === "gst" && (
          <div className={styles.formCard} role="tabpanel" id={id + "-panel-gst"} aria-labelledby={id + "-tab-gst"}>
            <h4 className={styles.formTitle}>GST (GSM→GST):</h4>

            <div className={styles.inlineField}>
              <label className={styles.field}><span>Период</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                className={styles.compactInput}
                type="text"
                placeholder="Все периоды"
                value={gstPeriod}
                onChange={(e) => setGstPeriod(e.currentTarget.value)}
              /></label>
            </div>

            <div className={styles.inlineField}>
              <label className={styles.field}><span>Код МО</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                className={styles.compactInput}
                type="text"
                placeholder="Все МО"
                value={gstMoCode}
                onChange={(e) => setGstMoCode(e.currentTarget.value)}
              /></label>
              <Button sx={documentButtonSx} variant="contained" size="small" startIcon={<CloudDownloadIcon sx={{ fontSize: 16 }} />}
                type="button"

                onClick={handleExportGst}
                loading={loadingKey === "gst"}
                disabled={!gstPeriod || loadingKey === "gst"}
              >
                Выгрузить
              </Button>
            </div>
        </div>
        )}

        {isAdmin && activeFormat === "gpt" && (
          <div className={styles.formCard} role="tabpanel" id={id + "-panel-gpt"} aria-labelledby={id + "-tab-gpt"}>
            <h4 className={styles.formTitle}>GPT (GPM→GPT):</h4>
            <div className={styles.inlineField}>
              <label className={styles.field}><span>Период</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                className={styles.compactInput}
                type="text"
                placeholder="Все периоды"
                value={gptPeriod}
                onChange={(e) => setGptPeriod(e.currentTarget.value)}
              /></label>
            </div>
            <div className={styles.inlineField}>
              <label className={styles.field}><span>Код МО</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                className={styles.compactInput}
                type="text"
                placeholder="Все МО"
                value={gptMoCode}
                onChange={(e) => setGptMoCode(e.currentTarget.value)}
              /></label>
              <Button sx={documentButtonSx} variant="contained" size="small" startIcon={<CloudDownloadIcon sx={{ fontSize: 16 }} />}
                type="button"

                onClick={handleExportGpt}
                loading={loadingKey === "gpt"}
                disabled={!gptPeriod || loadingKey === "gpt"}
              >
                Выгрузить
              </Button>
            </div>
          </div>
        )}

        {!isSmo && activeFormat === "gf" && (
          <div className={styles.formCard} role="tabpanel" id={id + "-panel-gf"} aria-labelledby={id + "-tab-gf"}>
            <h4 className={styles.formTitle}>GF:</h4>
            <div className={styles.inlineField}>
              <label className={styles.field}><span>Период</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                className={styles.compactInput}
                type="text"
                placeholder="Все периоды"
                value={gfPeriod}
                onChange={(e) => setGfPeriod(e.currentTarget.value)}
              /></label>
            </div>
            <div className={styles.inlineField}>
              <label className={styles.field}><span>Код МО</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                className={styles.compactInput}
                type="text"
                placeholder="Все МО"
                value={gfMoCode}
                onChange={(e) => setGfMoCode(e.currentTarget.value)}
              /></label>
              <label className={styles.field}><span>Номер файла</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                className={`${styles.compactInput} ${styles.fileNumber}`}
                type="text"
                placeholder="Пакет"
                value={gfFileNumber}
                onChange={(e) => setGfFileNumber(e.currentTarget.value)}
              /></label>
              <Button sx={documentButtonSx} variant="contained" size="small" startIcon={<CloudDownloadIcon sx={{ fontSize: 16 }} />}
                type="button"

                onClick={handleExportGf}
                loading={loadingKey === "gf"}
                disabled={!gfPeriod || loadingKey === "gf"}
              >
                Выгрузить
              </Button>
            </div>
          </div>
        )}

        {!isSmo && activeFormat === "pf" && (
          <div className={styles.formCard} role="tabpanel" id={id + "-panel-pf"} aria-labelledby={id + "-tab-pf"}>
            <h4 className={styles.formTitle}>PF:</h4>
            <div className={styles.inlineField}>
              <label className={styles.field}><span>Период</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                className={styles.compactInput}
                type="text"
                placeholder="Все периоды"
                value={pfPeriod}
                onChange={(e) => setPfPeriod(e.currentTarget.value)}
              /></label>
            </div>
            <div className={styles.inlineField}>
              <label className={styles.field}><span>Код МО</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                className={styles.compactInput}
                type="text"
                placeholder="Все МО"
                value={pfMoCode}
                onChange={(e) => setPfMoCode(e.currentTarget.value)}
              /></label>
              <Button sx={documentButtonSx} variant="contained" size="small" startIcon={<CloudDownloadIcon sx={{ fontSize: 16 }} />}
                type="button"

                onClick={handleExportPf}
                loading={loadingKey === "pf"}
                disabled={!pfPeriod || loadingKey === "pf"}
              >
                Выгрузить
              </Button>
            </div>
          </div>
        )}
      </div>


      {/* ============================== */}
      {/* Нижняя строка — DSPN/PROF для СМО */}
      {/* ============================== */}
      <div className={styles.gridRow}>
        {/* DSPN → СМО */}
        {!isMo && activeFormat === "dspn-smo" && (
          <div className={styles.formCard} role="tabpanel" id={id + "-panel-dspn-smo"} aria-labelledby={id + "-tab-dspn-smo"}>
            <h4 className={styles.formTitle}>DSPN → СМО:</h4>

            <div className={styles.inlineField}>
              <label className={styles.field}><span>Период</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                className={styles.compactInput}
                type="text"
                placeholder="Период (ГГГГ-ММ)"
                value={dspnPeriod}
                onChange={(e) => setDspnPeriod(e.currentTarget.value)}
                disabled={loadingKey === "dspn-smo"}
              /></label>
            </div>

            {isAdmin && (
              <div className={styles.inlineField}>
                <label className={styles.field}><span>Код СМО</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                  className={styles.compactInput}
                  type="text"
                  placeholder="Код СМО (например, 19001)"
                  value={smoCodeForDspn}
                  onChange={(e) => setSmoCodeForDspn(e.currentTarget.value)}
                  disabled={loadingKey === "dspn-smo"}
                /></label>
              </div>
            )}

            <div className={styles.inlineField}>
              <Button sx={documentButtonSx} variant="contained" size="small" startIcon={<CloudDownloadIcon sx={{ fontSize: 16 }} />}
                type="button"

                onClick={handleExportDspnToSmo}
                loading={loadingKey === "dspn-smo"}
                disabled={
                  !dspnPeriod.trim() ||
                  loadingKey === "dspn-smo" ||
                  (isAdmin && !smoCodeForDspn.trim())
                }
              >
                Выгрузить
              </Button>
            </div>
          </div>
        )}

        {/* PROF → СМО */}
        {!isMo && activeFormat === "prof-smo" && (
          <div className={styles.formCard} role="tabpanel" id={id + "-panel-prof-smo"} aria-labelledby={id + "-tab-prof-smo"}>
            <h4 className={styles.formTitle}>PROF → СМО:</h4>

            <div className={styles.inlineField}>
              <label className={styles.field}><span>Период</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                className={styles.compactInput}
                type="text"
                placeholder="Период (ГГГГ-ММ)"
                value={profPeriod}
                onChange={(e) => setProfPeriod(e.currentTarget.value)}
                disabled={loadingKey === "prof-smo"}
              /></label>
            </div>

            {isAdmin && (
              <div className={styles.inlineField}>
                <label className={styles.field}><span>Код СМО</span><TextField variant="filled" hiddenLabel size="small" fullWidth sx={documentInputSx} slotProps={{ input: { disableUnderline: true } }}
                  className={styles.compactInput}
                  type="text"
                  placeholder="Код СМО (например, 19001)"
                  value={smoCodeForProf}
                  onChange={(e) => setSmoCodeForProf(e.currentTarget.value)}
                  disabled={loadingKey === "prof-smo"}
                /></label>
              </div>
            )}

            <div className={styles.inlineField}>
              <Button sx={documentButtonSx} variant="contained" size="small" startIcon={<CloudDownloadIcon sx={{ fontSize: 16 }} />}
                type="button"

                onClick={handleExportProfToSmo}
                loading={loadingKey === "prof-smo"}
                disabled={
                  !profPeriod.trim() ||
                  loadingKey === "prof-smo" ||
                  (isAdmin && !smoCodeForProf.trim())
                }
              >
                Выгрузить
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
