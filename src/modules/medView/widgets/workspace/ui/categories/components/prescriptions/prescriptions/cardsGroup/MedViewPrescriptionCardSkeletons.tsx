import { Skeleton } from "@mui/material";
import styles from "./styles.module.scss";

export const MedViewPrescriptionCardSkeletons = () => (
  <div className={styles.prescriptionsCards} role="status" aria-label="Загрузка назначений">
    {Array.from({ length: 2 }, (_, index) => (
      <div className={styles.panel} key={index} aria-hidden="true">
        <div className={styles.panelHeading}><Skeleton width="12rem" /></div>
        <div className={styles.groups}>
          <div className={styles.mainGroup}>
            <div className={styles.fields}>
              <div className={styles.wideField}>
                <Skeleton width="8rem" />
                <Skeleton height={30} />
                <Skeleton width="5rem" />
              </div>
              {Array.from({ length: 2 }, (_, field) => (
                <div key={field}><Skeleton width="70%" /><Skeleton /></div>
              ))}
            </div>
          </div>
          {Array.from({ length: 2 }, (_, group) => (
            <div className={styles.group} key={group}>
              <Skeleton width="7rem" height={24} />
              <div className={styles.fields}>
                {Array.from({ length: 2 }, (_, field) => (
                  <div key={field}><Skeleton width="70%" /><Skeleton /></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
