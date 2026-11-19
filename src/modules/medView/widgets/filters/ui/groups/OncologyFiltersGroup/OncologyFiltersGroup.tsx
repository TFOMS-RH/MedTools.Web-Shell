import type { OncologyFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { OncologyCaseFiltersSubgroup } from "./OncologyCaseFiltersSubgroup";
import { OncologyServiceFiltersSubgroup } from "./OncologyServiceFiltersSubgroup";
import { MedicationFiltersSubgroup } from "./MedicationFiltersSubgroup";

interface OncologyFiltersGroupProps {
  oncologyFiltersGroupDraft: OncologyFiltersGroupDraft;
  setOncologyFiltersGroupDraft: (
    oncologyFiltersGroupDraft: OncologyFiltersGroupDraft,
  ) => void;
}

const OncologyFiltersGroup = ({
  oncologyFiltersGroupDraft,
  setOncologyFiltersGroupDraft,
}: OncologyFiltersGroupProps) => {
  return (
    <>
      <OncologyCaseFiltersSubgroup
        oncologyCaseFiltersSubgroupDraft={
          oncologyFiltersGroupDraft.oncologyCase
        }
        setOncologyCaseFiltersSubgroupDraft={(oncologyCase) =>
          setOncologyFiltersGroupDraft({
            ...oncologyFiltersGroupDraft,
            oncologyCase: oncologyCase,
          })
        }
      />

      <OncologyServiceFiltersSubgroup
        oncologyServiceFiltersSubgroupDraft={
          oncologyFiltersGroupDraft.oncologyService
        }
        setOncologyServiceFiltersSubgroupDraft={(oncologyService) =>
          setOncologyFiltersGroupDraft({
            ...oncologyFiltersGroupDraft,
            oncologyService: oncologyService,
          })
        }
      />

      <MedicationFiltersSubgroup
        medicationFiltersSubgroupDraft={oncologyFiltersGroupDraft.medication}
        setMedicationFiltersSubgroupDraft={(medication) =>
          setOncologyFiltersGroupDraft({
            ...oncologyFiltersGroupDraft,
            medication: medication,
          })
        }
      />
    </>
  );
};

export default OncologyFiltersGroup;
