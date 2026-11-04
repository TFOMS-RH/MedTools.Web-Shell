import styles from "./styles.module.scss";

export const RControlInvoiceSummaryCardHeader = ({ invoiceNumber, invoiceUid }: {
  invoiceNumber?: string;
  invoiceUid: number;
}) => {
  return (
    <header className={styles.header}>
      <h3 id="rcontrol-invoice-summary-title">Финансовая сводка</h3>
      <p>{invoiceNumber ? `Счёт № ${invoiceNumber}` : `UID счёта: ${invoiceUid}`}</p>
    </header>
  );
};
