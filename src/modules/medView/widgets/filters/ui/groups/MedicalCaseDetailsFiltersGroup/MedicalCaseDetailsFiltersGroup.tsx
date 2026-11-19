import type { MedicalCaseDetailsFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { CompletedCaseDetailsFiltersSubgroup } from "./CompletedCaseDetailsFiltersSubgroup";
import { MedicalCaseDetailsFiltersSubgroup } from "./MedicalCaseDetailsFiltersSubgroup";

interface MedicalCaseDetailsFiltersGroupProps {
  medicalCaseDetailsFiltersGroupDraft: MedicalCaseDetailsFiltersGroupDraft;
  setMedicalCaseDetailsFiltersGroupDraft: (
    medicalCaseDetailsFiltersGroupDraft: MedicalCaseDetailsFiltersGroupDraft,
  ) => void;
}

const MedicalCaseDetailsFiltersGroup = ({
  medicalCaseDetailsFiltersGroupDraft,
  setMedicalCaseDetailsFiltersGroupDraft,
}: MedicalCaseDetailsFiltersGroupProps) => {
  return (
    <>
      <MedicalCaseDetailsFiltersSubgroup
        medicalCaseDetailsFiltersSubgroupDraft={
          medicalCaseDetailsFiltersGroupDraft.medicalCaseDetails
        }
        setMedicalCaseDetailsFiltersSubgroupDraft={(medicalCaseDetails) =>
          setMedicalCaseDetailsFiltersGroupDraft({
            ...medicalCaseDetailsFiltersGroupDraft,
            medicalCaseDetails: medicalCaseDetails,
          })
        }
      />

      <CompletedCaseDetailsFiltersSubgroup
        completedCaseDetailsFiltersSubgroupDraft={
          medicalCaseDetailsFiltersGroupDraft.completedCaseDetails
        }
        setCompletedCaseDetailsFiltersSubgroupDraft={(completedCaseDetails) =>
          setMedicalCaseDetailsFiltersGroupDraft({
            ...medicalCaseDetailsFiltersGroupDraft,
            completedCaseDetails: completedCaseDetails,
          })
        }
      />
    </>
  );
};

export default MedicalCaseDetailsFiltersGroup;
