import type { PersonFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { InsuranceFiltersSubgroup } from "./InsuranceFiltersSubgroup";
import { PatientFiltersSubgroup } from "./PatientFiltersSubgroup";
import { RepresentativeFiltersSubgroup } from "./RepresentativeFiltersSubgroup";
import styles from "./styles.module.scss";

interface PersonFiltersGroupRootProps {
  personFiltersGroupDraft: PersonFiltersGroupDraft;
  setPersonFiltersGroupDraft: (person: PersonFiltersGroupDraft) => void;
}

const PersonFiltersGroup = ({
  personFiltersGroupDraft,
  setPersonFiltersGroupDraft,
}: PersonFiltersGroupRootProps) => {
  return (
    <>
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
      />
    </>
  );
};

export default PersonFiltersGroup;
