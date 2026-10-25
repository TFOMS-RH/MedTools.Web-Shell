import type { ReactNode } from "react";
import styles from "./styles.module.scss";

interface RControlOncologyLayoutProps {
  casePanel: ReactNode;
  consultationsPanel: ReactNode;
  diagnosticsPanel: ReactNode;
  contraindicationsPanel: ReactNode;
  services: ReactNode;
  medications: ReactNode;
  dates: ReactNode;
  injections: ReactNode;
  selection: {
    serviceType: string;
    drugIdentifier: string;
    therapyRegimenCode: string | null;
  } | null;
}

/** The same oncology composition for live data and the offline development preview. */
export const RControlOncologyLayout = (props: RControlOncologyLayoutProps) => (
  <section className={styles.oncologyRoot}>
    <div className={styles.topSection}>
      <div className={styles.pairedPanels}>
        {props.casePanel}
        {props.consultationsPanel}
      </div>
      <div className={styles.pairedPanels}>
        {props.diagnosticsPanel}
        {props.contraindicationsPanel}
      </div>
    </div>
    <section
      className={styles.treatment}
      aria-labelledby="rcontrol-oncology-treatment"
    >
      <h2 className={styles.sectionHeading} id="rcontrol-oncology-treatment">
        Лечение
      </h2>
      <div className={styles.pairedPanels}>
        <section
          className={styles.panel}
          aria-labelledby="rcontrol-oncology-services"
        >
          <h3 className={styles.groupHeading} id="rcontrol-oncology-services">
            Онкологические услуги
          </h3>
          {props.services}
        </section>
        <section
          className={styles.panel}
          aria-labelledby="rcontrol-oncology-medications"
        >
          <h3 className={styles.groupHeading} id="rcontrol-oncology-medications">
            Препараты выбранной услуги
          </h3>
          {props.medications}
        </section>
      </div>
      <section
        className={styles.administrations}
        aria-labelledby="rcontrol-oncology-administrations"
      >
        <h3
          className={styles.groupHeading}
          id="rcontrol-oncology-administrations"
        >
          Введения выбранного препарата
        </h3>
        {props.selection && (
          <dl
            className={styles.context}
            aria-label="Выбранные услуга и препарат"
          >
            <div>
              <dt>Тип услуги</dt>
              <dd>{props.selection.serviceType}</dd>
            </div>
            <div>
              <dt>Регистрационный номер</dt>
              <dd>{props.selection.drugIdentifier}</dd>
            </div>
            {props.selection.therapyRegimenCode?.trim() && (
              <div>
                <dt>Код схемы терапии</dt>
                <dd>{props.selection.therapyRegimenCode}</dd>
              </div>
            )}
          </dl>
        )}
        {props.dates}
        {props.injections}
      </section>
    </section>
  </section>
);
