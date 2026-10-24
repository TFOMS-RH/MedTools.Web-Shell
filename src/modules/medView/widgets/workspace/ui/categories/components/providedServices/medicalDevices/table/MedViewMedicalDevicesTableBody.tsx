import type { MedicalDeviceDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/providedServices/GetMedicalDevicesResult";
import { TableSkeleton } from "../../../../../../../../../../shared/ui/TableSkeleton/TableSkeleton";
import { displayValue, formatServiceDate } from "../../presentation";
import styles from "./styles.module.scss";

interface MedViewMedicalDevicesTableBodyProps {
  medicalDevices: MedicalDeviceDto[];
  isPending: boolean;
}

export const MedViewMedicalDevicesTableBody = ({
  medicalDevices,
  isPending,
}: MedViewMedicalDevicesTableBodyProps) => (
  <div
    className={`mt-table-viewport ${styles.viewport}`}
    role="region"
    aria-label="Таблица медицинских изделий"
    tabIndex={0}
    aria-busy={isPending}
  >
    <table className={`mt-table ${styles.devicesTable}`} aria-labelledby="medview-devices-heading">
      <colgroup>
        <col className={styles.dateColumn} />
        <col className={styles.codeColumn} />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Дата установки</th>
          <th scope="col">Код вида</th>
          <th scope="col">Серийный номер</th>
        </tr>
      </thead>
      <tbody>
        {isPending ? <TableSkeleton columns={3} rows={5} /> : medicalDevices.map((device) => (
          <tr key={device.medicalDeviceUid}>
            <td className={styles.dateValue}>{formatServiceDate(device.implantationDate)}</td>
            <td>{displayValue(device.medicalDeviceTypeCode)}</td>
            <td>{displayValue(device.serialNumber)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
