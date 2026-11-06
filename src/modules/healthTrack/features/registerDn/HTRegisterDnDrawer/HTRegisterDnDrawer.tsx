import { useId } from "react";
// ==========================================
// modules/healthTrack/features/registerDn/HTRegisterDnDrawer/HTRegisterDnDrawer.tsx
// ==========================================
import {
  CircularProgress,
  Button,
  Drawer,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useRegisterDnDetailsQuery } from "../../../hooks/useRegisterDnQueries";

import {
  buildFullName,
  formatGender,
  getDnState,
  HT_DN_STATE_LABELS,
  HT_DN_STATUS_LABELS,
  HT_SOURCES_LABELS,
} from "../../../types/htRegisterDn";

import { documentButtonSx } from "../../documents/controlsSx";
import { getApiError } from "../../../../../shared/helpers/getApiError";
import styles from "./styles.module.scss";

// ==========================================
// Пропсы.
// ==========================================
interface HTRegisterDnDrawerProps {
  enp: string | null;
  onClose: () => void;
}

// ==========================================
// Форматирование даты.
// ==========================================
const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

const formatInt = (v: number | null): string => {
  if (v === null || v === undefined) return "—";
  return String(v);
};

/**
 * Drawer с детальной карточкой пациента.
 */
export const HTRegisterDnDrawer = ({
  enp,
  onClose,
}: HTRegisterDnDrawerProps) => {
  const id = useId();
  const { data: patient, isLoading, isFetching, isError, isSuccess, error, refetch } =
    useRegisterDnDetailsQuery(enp);

  const open = enp !== null;
  const requestError = isError ? getApiError(error, "Не удалось загрузить карточку пациента") : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: styles.paper, role: "dialog", "aria-modal": true, "aria-labelledby": id + "-title",
          sx: {
            width: { xs: "100%", sm: "36rem", md: "46rem" },
            maxWidth: "100%",
            borderRadius: { xs: 0, sm: "var(--mt-radius-card) 0 0 var(--mt-radius-card)" },
            border: 0, boxShadow: "none", overflow: "hidden",
            background: "var(--mt-surface)",
          },
        },
      }}
    >
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.caption}>Карточка пациента</p>
          <h2 id={id + "-title"} className={styles.title}>
            {patient && !isError ? buildFullName(patient.fam, patient.im, patient.ot) : "Пациент"}
          </h2>
          <p className={styles.enp}>ЕНП: {patient && !isError ? patient.enp : enp}</p>
        </div>

        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Закрыть карточку пациента"
          className={styles.closeButton}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </header>

      {/* Content */}
      <section className={styles.content} aria-busy={isFetching}>
        {isLoading && (
          <div className={styles.loadingBlock} role="status">
            <CircularProgress size={24} sx={{ color: "var(--mt-healthtrack-accent)" }} />
            <span>Загрузка…</span>
          </div>
        )}

        {requestError && !isLoading && (
          <div className={styles.errorBlock} role="alert">
            <h3>{requestError.status === 404 ? "Пациент не найден" : requestError.status === 403
              ? "Нет доступа к карточке пациента" : "Не удалось загрузить карточку пациента"}</h3>
            <p>{requestError.message}</p>
            <Button sx={documentButtonSx} variant="outlined" size="small"
              disabled={isFetching} onClick={() => void refetch()}>Повторить</Button>
          </div>
        )}
        {isSuccess && !patient && (
          <p className={styles.emptyText} role="status">Сведения о пациенте отсутствуют.</p>
        )}
        {patient && !isLoading && !isError && isFetching && (
          <p className={styles.emptyText} role="status">Обновление сведений…</p>
        )}

        {patient && !isLoading && !isError && (
          <>
            {/* Источники */}
            <div className={styles.sourcesRow}>
              <span>Источники: {" "}
                {HT_SOURCES_LABELS[patient.sources] ?? patient.sources}
              </span>
            </div>

            {/* Паспорт */}
            <div className={styles.patientPanel}>
              <h3 className={styles.sectionTitle}>Пациент</h3>
              <dl className={styles.dl}>
                <div className={styles.dlRow}>
                  <dt>Дата рождения</dt>
                  <dd>{formatDate(patient.birthDate)}</dd>
                </div>
                <div className={styles.dlRow}>
                  <dt>Пол</dt>
                  <dd>{formatGender(patient.gender)}</dd>
                </div>
                {patient.snils && (
                  <div className={styles.dlRow}>
                    <dt>СНИЛС</dt>
                    <dd>{patient.snils}</dd>
                  </div>
                )}
                {patient.smo && (
                  <div className={styles.dlRow}>
                    <dt>СМО</dt>
                    <dd>{patient.smo}</dd>
                  </div>
                )}
                {patient.spolis && (
                  <div className={styles.dlRow}>
                    <dt>СПОЛИС</dt>
                    <dd>{patient.spolis}</dd>
                  </div>
                )}
                {patient.npolis && (
                  <div className={styles.dlRow}>
                    <dt>НПОЛИС</dt>
                    <dd>{patient.npolis}</dd>
                  </div>
                )}
                {patient.adres && (
                  <div className={styles.dlRow}>
                    <dt>Адрес</dt>
                    <dd>{patient.adres}</dd>
                  </div>
                )}
                {patient.tel && (
                  <div className={styles.dlRow}>
                    <dt>Телефон</dt>
                    <dd>{patient.tel}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Эпизоды ДН */}
            {(
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Эпизоды ДН ({patient.episodes.length})
                </h3>
                {patient.episodes.length === 0 && <p className={styles.emptyText}>Эпизоды ДН отсутствуют.</p>}

                {patient.episodes.map((ep) => {
                  const dnState = getDnState(ep);

                  return (
                    <div key={ep.dspnRecordId} className={styles.episode}>
                      {/* Заголовок эпизода */}
                      <div className={styles.episodeHeader}>
                        <span className={styles.episodeNZap}>
                          ZAP #{ep.nZap}
                        </span>
                        <span
                          className={`${styles.episodeState} ${
                            dnState === "active"
                              ? styles.episodeStateActive
                              : styles.episodeStateClosed
                          }`}
                        >
                          {HT_DN_STATE_LABELS[dnState]}
                        </span>
                      </div>

                      {/* Диагноз */}
                      <div className={styles.episodeDiag}>
                        <strong>{ep.diagCode ?? "—"}</strong>
                        {ep.diagName && ` — ${ep.diagName}`}
                      </div>

                      {/* Даты */}
                      <dl className={styles.dl}>
                        <div className={styles.dlRow}>
                          <dt>Дата диагноза</dt>
                          <dd>{formatDate(ep.diagDate)}</dd>
                        </div>
                        <div className={styles.dlRow}>
                          <dt>Дата постановки</dt>
                          <dd>{formatDate(ep.dateDnIn)}</dd>
                        </div>
                        <div className={styles.dlRow}>
                          <dt>Дата снятия</dt>
                          <dd>{formatDate(ep.dateDnOut)}</dd>
                        </div>
                        {ep.statusDnIn && (
                          <div className={styles.dlRow}>
                            <dt>Статус ДН</dt>
                            <dd>
                              {HT_DN_STATUS_LABELS[ep.statusDnIn] ??
                                formatInt(ep.statusDnIn)}
                            </dd>
                          </div>
                        )}
                        {ep.moP && (
                          <div className={styles.dlRow}>
                            <dt>МО</dt>
                            <dd>{ep.moP}</dd>
                          </div>
                        )}
                        {ep.period && (
                          <div className={styles.dlRow}>
                            <dt>Период</dt>
                            <dd>{ep.period}</dd>
                          </div>
                        )}
                      </dl>

                      {/* PLAN */}
                      <div className={styles.relatedGroups}>
                      {ep.plan && Object.values({ mcodPlan: ep.plan.mcodPlan, moPodrId: ep.plan.moPodrId,
                        medAreaCode: ep.plan.medAreaCode, dsCode: ep.plan.dsCode,
                        planDateStart: ep.plan.planDateStart, planDateEnd: ep.plan.planDateEnd }).some(Boolean) ? (
                        <div className={styles.subsection}>
                          <h5 className={styles.subsectionTitle}>PLAN</h5>
                          <dl className={styles.dl}>
                            {ep.plan.mcodPlan && (
                              <div className={styles.dlRow}>
                                <dt>Код МО плана</dt>
                                <dd>{ep.plan.mcodPlan}</dd>
                              </div>
                            )}
                            {ep.plan.moPodrId && (
                              <div className={styles.dlRow}>
                                <dt>Подразделение</dt>
                                <dd>{ep.plan.moPodrId}</dd>
                              </div>
                            )}
                            {ep.plan.medAreaCode && (
                              <div className={styles.dlRow}>
                                <dt>Участок</dt>
                                <dd>{ep.plan.medAreaCode}</dd>
                              </div>
                            )}
                            {ep.plan.planDateStart && (
                              <div className={styles.dlRow}>
                                <dt>План. старт</dt>
                                <dd>{formatDate(ep.plan.planDateStart)}</dd>
                              </div>
                            )}
                            {ep.plan.planDateEnd && (
                              <div className={styles.dlRow}>
                                <dt>План. конец</dt>
                                <dd>{formatDate(ep.plan.planDateEnd)}</dd>
                              </div>
                            )}
                            {ep.plan.dsCode && (
                              <div className={styles.dlRow}>
                                <dt>Диагноз по плану</dt>
                                <dd>{ep.plan.dsCode}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      ) : (
                        <div className={styles.subsection}>
                          <h5 className={styles.subsectionTitle}>PLAN</h5>
                          <p className={styles.emptyText}>Сведения PLAN отсутствуют.</p>
                        </div>
                      )}


                      {/* INF */}
                      {ep.inf && (ep.inf.infType !== null || ep.inf.sposobInf !== null || ep.inf.dataInf || ep.inf.infUpdated) ? (
                        <div className={styles.subsection}>
                          <h5 className={styles.subsectionTitle}>
                            Информирование
                          </h5>
                          <dl className={styles.dl}>
                            {ep.inf.infType !== null && (
                              <div className={styles.dlRow}>
                                <dt>Тип</dt>
                                <dd>{formatInt(ep.inf.infType)}</dd>
                              </div>
                            )}
                            {ep.inf.sposobInf !== null && (
                              <div className={styles.dlRow}>
                                <dt>Способ</dt>
                                <dd>{formatInt(ep.inf.sposobInf)}</dd>
                              </div>
                            )}
                            {ep.inf.dataInf && (
                              <div className={styles.dlRow}>
                                <dt>Дата</dt>
                                <dd>{formatDate(ep.inf.dataInf)}</dd>
                              </div>
                            )}
                            {ep.inf.infUpdated && (
                              <div className={styles.dlRow}>
                                <dt>Обновлено</dt>
                                <dd>Да</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      ) : (
                        <div className={styles.subsection}>
                          <h5 className={styles.subsectionTitle}>Информирование</h5>
                          <p className={styles.emptyText}>Сведения об информировании отсутствуют.</p>
                        </div>
                      )}
                      </div>


                      {/* Источник */}
                      {ep.sourceFileName && (
                        <div className={styles.sourceLine}>
                          Источник: {ep.sourceFileName}
                          {ep.period && ` (${ep.period})`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Данные ГИС ОМС (GF) */}
            {(
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Данные ГИС ОМС ({patient.gfRecords.length})
                </h3>
                {patient.gfRecords.length === 0 && <p className={styles.emptyText}>Записи GF отсутствуют.</p>}

                {patient.gfRecords.map((gf) => (
                  <div key={gf.gfRecordId} className={styles.gfCard}>
                    <dl className={styles.dl}>
                      {gf.attachMcode && (
                        <div className={styles.dlRow}>
                          <dt>МО прикрепления</dt>
                          <dd>{gf.attachMcode}</dd>
                        </div>
                      )}
                      {gf.attachDate && (
                        <div className={styles.dlRow}>
                          <dt>Дата прикрепления</dt>
                          <dd>{formatDate(gf.attachDate)}</dd>
                        </div>
                      )}
                      {gf.groupRhCode !== null && (
                        <div className={styles.dlRow}>
                          <dt>Группа здоровья</dt>
                          <dd>{formatInt(gf.groupRhCode)}</dd>
                        </div>
                      )}
                      {gf.groupRhDs && (
                        <div className={styles.dlRow}>
                          <dt>Диагноз группы</dt>
                          <dd>{gf.groupRhDs}</dd>
                        </div>
                      )}
                      {gf.groupRhProfile && (
                        <div className={styles.dlRow}>
                          <dt>Профиль</dt>
                          <dd>{gf.groupRhProfile}</dd>
                        </div>
                      )}
                      {gf.groupRhName && (
                        <div className={styles.dlRow}>
                          <dt>Группа</dt>
                          <dd>{gf.groupRhName}</dd>
                        </div>
                      )}
                    </dl>

                    {gf.sourceFileName && (
                      <div className={styles.sourceLine}>
                        Источник: {gf.sourceFileName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </Drawer>
  );
};
