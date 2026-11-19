import type { PrescriptionFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { PrescriptionFiltersSubgroup } from "./PrescriptionFiltersSubgroup";
import { ReferralFiltersSubgroup } from "./ReferralFiltersSubgroup";

interface PrescriptionFiltersGroupProps {
  prescriptionFiltersGroupDraft: PrescriptionFiltersGroupDraft;
  setPrescriptionFiltersGroupDraft: (
    prescriptionFiltersGroupDraft: PrescriptionFiltersGroupDraft,
  ) => void;
}

const PrescriptionFiltersGroup = ({
  prescriptionFiltersGroupDraft,
  setPrescriptionFiltersGroupDraft,
}: PrescriptionFiltersGroupProps) => {
  return (
    <>
      <PrescriptionFiltersSubgroup
        prescriptionFiltersSubgroup={prescriptionFiltersGroupDraft.prescription}
        setPrescriptionFiltersSubgroup={(prescription) =>
          setPrescriptionFiltersGroupDraft({
            ...prescriptionFiltersGroupDraft,
            prescription: prescription,
          })
        }
      />
      <ReferralFiltersSubgroup
        referralsFiltersSubgroupDraft={prescriptionFiltersGroupDraft.referral}
        setReferralsFiltersSubgroupDraft={(referral) =>
          setPrescriptionFiltersGroupDraft({
            ...prescriptionFiltersGroupDraft,
            referral: referral,
          })
        }
      />
    </>
  );
};

export default PrescriptionFiltersGroup;
