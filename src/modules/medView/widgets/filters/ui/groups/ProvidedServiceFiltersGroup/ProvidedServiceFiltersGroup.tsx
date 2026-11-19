import type { ProvidedServicesFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import { useMedViewFilterSearch } from "../../../../../../../shared/ui/medView/inputs/filterInputReset";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";
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
    useMedViewFilterSearch();

  const { data: providedServices, isFetching } = useFilterOptionsQuery(
    MedicalReferenceType.ProvidedServices,
    inputProvidedServiceValue,
  );

  return (
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
            loading={isFetching}
          />
        </div>
      </div>
    </div>
  );
};

export default ProvidedServiceFiltersGroup;
