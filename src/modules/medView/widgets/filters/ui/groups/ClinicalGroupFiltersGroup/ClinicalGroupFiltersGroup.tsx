import type { ClinicalGroupsFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { ClinicalGroupFiltersSubgroup } from "./ClinicalGroupFiltersSubgroup";
import { HighTechMedicalCareFiltersSubgroup } from "./HighTechMedicalCareFiltersSubgroup";

interface ClinicalGroupFiltersGroupProps {
  clinicalGroupFiltersGroup: ClinicalGroupsFiltersGroupDraft;
  setClinicalGroupFiltersGroup: (
    clinicalGroupFiltersGroup: ClinicalGroupsFiltersGroupDraft,
  ) => void;
}

const ClinicalGroupFiltersGroup = ({
  clinicalGroupFiltersGroup,
  setClinicalGroupFiltersGroup,
}: ClinicalGroupFiltersGroupProps) => {
  return (
    <>
      <ClinicalGroupFiltersSubgroup
        clinicalGroupFiltersSubgroupDraft={
          clinicalGroupFiltersGroup.clinicalGroups
        }
        setClinicalGroupFiltersSubgroupDraft={(clinicalGroups) =>
          setClinicalGroupFiltersGroup({
            ...clinicalGroupFiltersGroup,
            clinicalGroups: clinicalGroups,
          })
        }
      />
      <HighTechMedicalCareFiltersSubgroup
        highTechMedicalCareFiltersSubgroupDraft={
          clinicalGroupFiltersGroup.highTechMedicalCare
        }
        setHighTechMedicalCareFiltersSubgroupDraft={(highTechMedicalCare) =>
          setClinicalGroupFiltersGroup({
            ...clinicalGroupFiltersGroup,
            highTechMedicalCare: highTechMedicalCare,
          })
        }
      />
    </>
  );
};

export default ClinicalGroupFiltersGroup;
