import { Skeleton } from "@mui/material";
import { RControlProvidedServicesTable } from "./RControlProvidedServiceCards";
import styles from "./styles.module.scss";

export const RControlProvidedServiceCardSkeletons = () => (
  <RControlProvidedServicesTable isPending>
    {Array.from({ length: 2 }, (_, index) => (
      <tbody key={index} aria-hidden="true">
        <tr className={`noneHover ${styles.mainRow}`}>
          {Array.from({ length: 5 }, (_, column) => (
            <td key={column}><Skeleton /></td>
          ))}
        </tr>
        <tr className={`noneHover ${styles.detailsRow}`}>
          <td colSpan={5}>
            <div className={styles.detailsGrid}>
              {Array.from({ length: 6 }, (_, field) => (
                <div key={field} className={field === 5 ? styles.comment : undefined}>
                  <Skeleton width="9rem" />
                  <Skeleton />
                </div>
              ))}
            </div>
          </td>
        </tr>
      </tbody>
    ))}
  </RControlProvidedServicesTable>
);
