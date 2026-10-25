import { Skeleton } from "@mui/material";
import { RControlMedicalSanctionsTable } from "./RControlMedicalSanctionCards";
import styles from "./styles.module.scss";

export const RControlMedicalSanctionCardSkeletons = () => (
  <RControlMedicalSanctionsTable isPending>
    {Array.from({ length: 2 }, (_, index) => (
      <tbody key={index} aria-hidden="true">
        <tr className={`noneHover ${styles.mainRow}`}>
          {Array.from({ length: 5 }, (_, column) => (
            <td key={column}><Skeleton />{column === 4 && <Skeleton width="7rem" />}</td>
          ))}
        </tr>
        <tr className={`noneHover ${styles.detailsRow}`}>
          <td colSpan={5}>
            <div className={styles.detailsContent}>
              <div className={styles.detailsGrid}>
                {Array.from({ length: 4 }, (_, field) => (
                  <div key={field}><Skeleton width="70%" /><Skeleton /></div>
                ))}
              </div>
              <div className={styles.textFields}>
                {Array.from({ length: 2 }, (_, field) => (
                  <div key={field}><Skeleton width="7rem" /><Skeleton /></div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    ))}
  </RControlMedicalSanctionsTable>
);
