import type { ProvidedServicesFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import { useState } from "react";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { useFilterOptionsByCodeQuery } from "../../../model/queries/useFilterOptionsQuery";
import styles from "./styles.module.scss";

interface ProvidedServiceFiltersGroupProps {
  providedServiceDraft: ProvidedServicesFiltersGroupDraft;
  setProvidedServiceDraft: (
    providedServiceDraft: ProvidedServicesFiltersGroupDraft,
  ) => void;
}

const ProvidedServiceFiltersGroup = ({
  providedServiceDraft,
  setProvidedServiceDraft,
}: ProvidedServiceFiltersGroupProps) => {
  const [inputProvidedServiceValue, setInputProvidedServiceValue] =
    useState("");

  const { data: providedServices, isPending } = useFilterOptionsByCodeQuery(
    "Т003",
    "provided-service",
    inputProvidedServiceValue,
  );

  return (
    <section className={styles.providedServiceFiltersGroup}>
      <header className={styles.providedServiceFiltersGroupHeader}>
        <div className={styles.titleGroup}>
          <h2>Фильтрация по услугам</h2>
          <p className={styles.description}>
            Все поля, которые относятся к услугам
          </p>
        </div>
      </header>
      <div className={styles.providedServiceFiltersSubgroup}>
        <header className={styles.subgroupHeader}>
          <h3>Услуги</h3>
        </header>
        <div className={styles.groupLineGrid}>
          <div className={styles.span12}>
            <MedViewAutocompleteInput
              label="Название услуги"
              values={providedServiceDraft.serviceCodes}
              options={providedServices ?? []}
              inputValue={inputProvidedServiceValue}
              onInputChange={setInputProvidedServiceValue}
              onChange={(newValue: FilterOption[]) =>
                setProvidedServiceDraft({
                  ...providedServiceDraft,
                  serviceCodes: newValue,
                })
              }
              loading={isPending}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProvidedServiceFiltersGroup;
