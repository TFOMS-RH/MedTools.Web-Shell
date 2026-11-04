import { Skeleton } from "@mui/material";
import styles from "./styles.module.scss";

export const MedViewMedicalCaseCardSkeletons = () => {
  return (
    <section
      className={styles.medicalCasesCards}
      aria-label="Загрузка медицинских случаев"
      aria-busy="true"
      role="status"
    >
      <ul className={styles.list} aria-hidden="true">
        {Array.from({ length: 2 }).map((_, index) => (
          <li key={index}>
            <article className={`${styles.card} ${styles.skeletonCard}`}>
              <div className={styles.identity}>
                <h3 className={styles.heading}>Медицинский случай</h3>
                <p className={styles.period}>
                  <Skeleton width="80%" />
                </p>
                <dl className={styles.facts}>
                  {["Категория", "Профиль", "Специальность", "Количество"].map(
                    (label) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>
                          <Skeleton width={40} />
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
              </div>
              <div className={styles.diagnosis}>
                <h4 className={styles.zoneLabel}>Основной диагноз</h4>
                <Skeleton width={72} />
              </div>
              <dl className={styles.finances}>
                {["Тариф", "Предъявлено", "Принято", "Принято СМО"].map(
                  (label) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>
                        <Skeleton width={96} />
                      </dd>
                    </div>
                  ),
                )}
              </dl>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
};
