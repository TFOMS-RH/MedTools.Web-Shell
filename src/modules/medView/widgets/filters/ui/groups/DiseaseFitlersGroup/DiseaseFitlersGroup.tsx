import type { DiseaseFitlersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { AdditionalDiseaseFiltersSubgroup } from "./AdditionalDiseaseFiltersSubgroup";
import { BaseDiseaseFiltersSubgroup } from "./BaseDiseaseFiltersSubgroup";

interface DiseaseFitlersGroupProps {
  diseaseFiltersGroupDraft: DiseaseFitlersGroupDraft;
  setDiseaseFiltersGroupDraft: (
    diseaseFiltersGroupDraft: DiseaseFitlersGroupDraft,
  ) => void;
}

export const DiseaseFitlersGroup = ({
  diseaseFiltersGroupDraft,
  setDiseaseFiltersGroupDraft,
}: DiseaseFitlersGroupProps) => {
  return (
    <>
      <BaseDiseaseFiltersSubgroup
        baseDiseaseFitlersSubgroupDraft={diseaseFiltersGroupDraft.baseDisease}
        setBaseDiseaseFitlersSubgroupDraft={(baseDisease) =>
          setDiseaseFiltersGroupDraft({
            ...diseaseFiltersGroupDraft,
            baseDisease: baseDisease,
          })
        }
      />
      <AdditionalDiseaseFiltersSubgroup
        additionalDiseaseFiltersSubgroupDraft={
          diseaseFiltersGroupDraft.additionalDisease
        }
        setAdditionalDiseaseFiltersSubgroupDraft={(additionalDisease) =>
          setDiseaseFiltersGroupDraft({
            ...diseaseFiltersGroupDraft,
            additionalDisease: additionalDisease,
          })
        }
      />
    </>
  );
};
