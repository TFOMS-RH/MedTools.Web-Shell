import type { PersonFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { useFilterOptionsByCodeQuery } from "../../../model/queries/useFilterOptionsQuery";
import { InsuranceFiltersSubgroup } from "./InsuranceFiltersSubgroup/InsuranceFiltersSubgroup";
import { PatientFiltersSubgroup } from "./PatientFiltersSubgroup/PatientFiltersSubgroup";
import { RepresentativeFiltersSubgroup } from "./RepresentativeFiltersSubgroup/RepresentativeFiltersSubgroup";
import styles from "./styles.module.scss";

interface PersonFiltersGroupRootProps {
  personFiltersGroupDraft: PersonFiltersGroupDraft;
  setPersonFiltersGroupDraft: (person: PersonFiltersGroupDraft) => void;
}

const PersonFiltersGroup = ({
  personFiltersGroupDraft,
  setPersonFiltersGroupDraft,
}: PersonFiltersGroupRootProps) => {
  const { data: policyTypeFilterOptions } = useFilterOptionsByCodeQuery(
    "F008",
    "insurance-policy-type",
  );

  return (
    <section className={styles.generalFiltersGroup}>
      <header className={styles.generalFiltersGroupHeader}>
        <div className={styles.titleGroup}>
          <h2>Фильтрация по персональным данным</h2>
          <p className={styles.description}>
            Все поля, которые относятся к данным пациента
          </p>
        </div>
      </header>

      <div className={styles.patientGroupLine}>
        <PatientFiltersSubgroup
          patientFiltersSubgroupDraft={personFiltersGroupDraft.patient}
          setPatientFiltersSubgroupDraft={(patient) =>
            setPersonFiltersGroupDraft({ ...personFiltersGroupDraft, patient })
          }
        />

        <RepresentativeFiltersSubgroup
          representativeFiltersSubgroupDraft={
            personFiltersGroupDraft.representative
          }
          setRepresentativeFiltersSubgroupDraft={(representative) =>
            setPersonFiltersGroupDraft({
              ...personFiltersGroupDraft,
              representative,
            })
          }
        />
      </div>

      <InsuranceFiltersSubgroup
        insuranceFiltersSubgroupDraft={personFiltersGroupDraft.insurance}
        setInsuranceFiltersSubgroupDraft={(insurance) =>
          setPersonFiltersGroupDraft({
            ...personFiltersGroupDraft,
            insurance,
          })
        }
        insuranceFilterOptions={[]}
        insurancePolicyTypeFilterOptions={policyTypeFilterOptions ?? []}
      />
    </section>
  );
};

export default PersonFiltersGroup;
