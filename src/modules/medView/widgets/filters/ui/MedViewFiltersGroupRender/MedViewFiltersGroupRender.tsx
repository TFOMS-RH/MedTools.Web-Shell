import { IconButton, Tooltip } from "@mui/material";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import type { FilterGroupId } from "../../../workspace/model/types/FilterId";
import type { FiltersDraft } from "../../../workspace/model/types/FiltersDraft";
import PersonFiltersGroupRoot from "../groups/PersonFiltersGroup/PersonFiltersGroup";
import MedicalCaseDetailsFiltersGroup from "../groups/MedicalCaseDetailsFiltersGroup/MedicalCaseDetailsFiltersGroup";
import OncologyFiltersGroup from "../groups/OncologyFiltersGroup/OncologyFiltersGroup";
import PrescriptionFiltersGroup from "../groups/PrescriptionFiltersGroup/PrescriptionFiltersGroup";
import ClinicalGroupFiltersGroup from "../groups/ClinicalGroupFiltersGroup/ClinicalGroupFiltersGroup";
import ProvidedServiceFiltersGroup from "../groups/ProvidedServiceFiltersGroup/ProvidedServiceFiltersGroup";
import SanctionFiltersGroup from "../groups/SanctionFiltersGroup/SanctionFiltersGroup";
import InternalServiceFiltersGroup from "../groups/InternalServiceFiltersGroup/InternalServiceFiltersGroup";
import { DiseaseFitlersGroup } from "../groups/DiseaseFitlersGroup/DiseaseFitlersGroup";
import { resetFilterActionSx } from "../resetFilterActionSx";
import { filterGroups } from "../../model/filterGroups";
import styles from "./styles.module.scss";

interface FiltersGroupRenderProps {
  filterGroupId: FilterGroupId;
  filtersDraft: FiltersDraft;
  setFiltersDraft: Dispatch<SetStateAction<FiltersDraft>>;
}

const MedViewFilterFields = ({
  filterGroupId,
  filtersDraft,
  setFiltersDraft,
}: FiltersGroupRenderProps) => {
  switch (filterGroupId) {
    case "persons":
      return (
        <PersonFiltersGroupRoot
          personFiltersGroupDraft={filtersDraft.person}
          setPersonFiltersGroupDraft={(person) =>
            setFiltersDraft((prev) => ({
              ...prev,
              person,
            }))
          }
        />
      );

    case "case-details":
      return (
        <MedicalCaseDetailsFiltersGroup
          medicalCaseDetailsFiltersGroupDraft={filtersDraft.medicalCaseDetails}
          setMedicalCaseDetailsFiltersGroupDraft={(medicalCaseDetails) =>
            setFiltersDraft((prev) => ({
              ...prev,
              medicalCaseDetails,
            }))
          }
        />
      );

    case "oncology":
      return (
        <OncologyFiltersGroup
          oncologyFiltersGroupDraft={filtersDraft.oncology}
          setOncologyFiltersGroupDraft={(oncology) =>
            setFiltersDraft((prev) => ({
              ...prev,
              oncology: oncology,
            }))
          }
        />
      );

    case "prescriptions":
      return (
        <PrescriptionFiltersGroup
          prescriptionFiltersGroupDraft={filtersDraft.prescription}
          setPrescriptionFiltersGroupDraft={(prescription) =>
            setFiltersDraft((prev) => ({
              ...prev,
              prescription: prescription,
            }))
          }
        />
      );

    case "clinical-groups":
      return (
        <ClinicalGroupFiltersGroup
          clinicalGroupFiltersGroup={filtersDraft.clinicalGroups}
          setClinicalGroupFiltersGroup={(clinicalGroups) =>
            setFiltersDraft((prev) => ({
              ...prev,
              clinicalGroups: clinicalGroups,
            }))
          }
        />
      );

    case "provided-services": {
      return (
        <ProvidedServiceFiltersGroup
          providedServiceDraft={filtersDraft.providedServices}
          setProvidedServiceDraft={(providedSevices) =>
            setFiltersDraft((prev) => ({
              ...prev,
              providedServices: providedSevices,
            }))
          }
        />
      );
    }

    case "sanctions": {
      return (
        <SanctionFiltersGroup
          sanctionFiltersGroupDraft={filtersDraft.sanction}
          setSanctionFiltersGroupDraft={(sanction) =>
            setFiltersDraft((prev) => ({
              ...prev,
              sanction: sanction,
            }))
          }
        />
      );
    }

    case "ICD": {
      return (
        <DiseaseFitlersGroup
          diseaseFiltersGroupDraft={filtersDraft.diseases}
          setDiseaseFiltersGroupDraft={(disease) =>
            setFiltersDraft((prev) => ({
              ...prev,
              diseases: disease,
            }))
          }
        />
      );
    }

    case "internal-service": {
      return (
        <InternalServiceFiltersGroup
          internalServiceFiltersGroupDraft={filtersDraft.inrernalService}
          setInternalServiceFiltersGroupDraft={(internalService) =>
            setFiltersDraft((prev) => ({
              ...prev,
              inrernalService: internalService,
            }))
          }
        />
      );
    }
  }
};

export const MedViewFiltersGroupRender = ({
  filterGroupId,
  filtersDraft,
  setFiltersDraft,
  onReset,
  canReset,
  onInput,
}: FiltersGroupRenderProps & {
  onReset: () => void;
  canReset: boolean;
  onInput: FormEventHandler<HTMLElement>;
}) => {
  const { title, description } = filterGroups[filterGroupId];
  const resetLabel = "Сбросить фильтры группы";

  return (
    <section className={styles.group} onInputCapture={onInput}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>
        <Tooltip title={resetLabel}>
          <span className={styles.resetAction}>
            <IconButton
              type="button"
              size="small"
              aria-label={resetLabel}
              disableRipple
              disabled={!canReset}
              onClick={onReset}
              sx={[
                resetFilterActionSx,
                { inlineSize: "var(--mt-space-10)", blockSize: "var(--mt-space-10)" },
              ]}
            >
              <ReplayRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </header>
      <MedViewFilterFields
        filterGroupId={filterGroupId}
        filtersDraft={filtersDraft}
        setFiltersDraft={setFiltersDraft}
      />
    </section>
  );
};
