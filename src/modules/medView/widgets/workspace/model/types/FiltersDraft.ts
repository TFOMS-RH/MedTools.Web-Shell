import type { Dayjs } from "dayjs";
import type { Sex } from "./Sex";
import type { FilterOption } from "./FilterOptions";

export interface FiltersDraft {
  person: PersonFiltersGroupDraft;
  medicalCaseDetails: MedicalCaseDetailsFiltersGroupDraft;
  oncology: OncologyFiltersGroupDraft;
  prescription: PrescriptionFiltersGroupDraft;
  clinicalGroups: ClinicalGroupsFiltersGroupDraft;
  providedServices: ProvidedServicesFiltersGroupDraft;
  sanction: SanctionFiltersGroupDraft;
  diseases: DiseaseFitlersGroupDraft;
  inrernalService: InternalServiceFiltersGroupDraft;
}

export interface DiseaseFitlersGroupDraft {
  additionalDisease: AdditionalDiseaseFiltersGroupDraft;
  baseDisease: BaseDiseaseFiltersGroupDraft;
}

export interface AdditionalDiseaseFiltersGroupDraft {
  initialDiagnoses: FilterOption[];
  concomitantDiagnoses: FilterOption[];
  complicationDiagnoses: FilterOption[];
}

export interface BaseDiseaseFiltersGroupDraft {
  primaryDiagnoses: FilterOption[];
  diagnosisClasses: string[];
  diagnosisSubClasses: string[];
}

export interface InternalServiceFiltersGroupDraft {
  patientUid: string;
  medicalCaseUid: string;
  completedCaseUid: string;
  invoiceNumber: string;
  invoiceUid: string;
  invoiceBillingMonth: string;
  invoiceBillingYear: string;
}

export interface SanctionFiltersGroupDraft {
  controlTypeCodes: string[];
  refusalReasons: FilterOption[];
  expertiseActNumber: string;
  expertiseActDate: Dayjs | null;
}

export interface ProvidedServicesFiltersGroupDraft {
  serviceCodes: FilterOption[];
}

export interface ClinicalGroupsFiltersGroupDraft {
  clinicalGroups: ClinicalGroupsFiltersSubgroupDraft;
  highTechMedicalCare: HighTechMedicalCareSubgroupDraft;
}

export interface ClinicalGroupsFiltersSubgroupDraft {
  clinicalStatisticGroupNumbers: FilterOption[];
  interruptedCasePaymentReasons: string[];
  complexityCoefficientNumbers: string[];
}

export interface HighTechMedicalCareSubgroupDraft {
  highTechCareTypes: FilterOption[];
  highTechCareMethods: FilterOption[];
  voucherIssueDate: Dayjs | null;
  voucherNumber: string;
  plannedAdmissionDates: Dayjs | null;
}

export interface PrescriptionFiltersGroupDraft {
  prescription: PrescriptionFiltersSubgroupDraft;
  referral: ReferralFiltersSubgroupDraft;
}

export interface PrescriptionFiltersSubgroupDraft {
  prescriptionTypes: string[];
  diagnosticMethods: string[];
  services: FilterOption[];
  referralDate: Dayjs | null;
  referredToMedicalOrganizations: string[];
  medicalCareProfiles: string[];
  bedProfiles: string[];
}

export interface ReferralFiltersSubgroupDraft {
  referralDate: Dayjs | null;
  referredToMedicalOrganizations: string[];
  refferalTypes: string[];
  diagnosticMethods: string[];
  referredServices: FilterOption[];
}

export interface OncologyFiltersGroupDraft {
  oncologyCase: OncologyCaseFiltersSubgroupDraft;
  oncologyService: OncologyServiceFiltersSubgroupDraft;
  medication: MedicationFiltersSubgroupDraft;
}

export interface MedicationFiltersSubgroupDraft {
  drugIdentifiers: FilterOption[];
  therapyRegimens: FilterOption[];
}

export interface OncologyServiceFiltersSubgroupDraft {
  serviceTypes: string[];
  surgicalTreatmentTypes: string[];
  drugTherapyLines: string[];
  drugTherapyCycles: string[];
  radioTherapyTypes: string[];
}

export interface OncologyCaseFiltersSubgroupDraft {
  referralReasons: string[];
  stages: FilterOption[];
}

export interface MedicalCaseDetailsFiltersGroupDraft {
  medicalCaseDetails: MedicalCaseDetailsFiltersSubgroupDraft;
  completedCaseDetails: CompletedCaseDetailsFiltersSubgroupDraft;
}

export interface MedicalCaseDetailsFiltersSubgroupDraft {
  medicalProfiles: string[];
  bedProfiles: string[];
  division: string;
  encounterMedicalOrganizations: string[];
  visitPurposes: string[];
  preventiveCarePlaces: string[];
  treatmentStartDate: Dayjs | null;
  treatmentEndDate: Dayjs | null;
  diseaseCharacters: string[];
  physicianSpecialties: string[];
  medicalRecordNumber: string;
}

export interface CompletedCaseDetailsFiltersSubgroupDraft {
  careConditions: string[];
  medicalCareTypes: string[];
  careForms: string[];
  medicalOrganizations: string[];
  referringMedicalOrganizations: string[];
  treatmentStartDate: Dayjs | null;
  treatmentEndDate: Dayjs | null;
  screeningResults: string[];
  hospitalizationOutcomes: string[];
  diseaseOutcomes: string[];
  paymentMethods: string[];
}

export interface PersonFiltersGroupDraft {
  patient: PatientFiltersSubgroupDraft;
  representative: RepresentativeFiltersSubgroupDraft;
  insurance: InsuranceFiltersSubgroupDraft;
}

export interface PatientFiltersSubgroupDraft {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: Dayjs | null;
  sex: Sex | null;
}

export interface RepresentativeFiltersSubgroupDraft {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: Dayjs | null;
  sex: Sex | null;
}

export interface InsuranceFiltersSubgroupDraft {
  insurances: string[];
  insurancePolicyTypes: string[];
  insurancePolicySeries: string;
  insurancePolicyNumbers: string[];
  unifiedPolicyNumbers: string[];
}

export const initialFiltersDraft: FiltersDraft = {
  person: {
    patient: {
      firstName: "",
      lastName: "",
      middleName: "",
      birthDate: null,
      sex: null,
    },
    representative: {
      firstName: "",
      lastName: "",
      middleName: "",
      birthDate: null,
      sex: null,
    },
    insurance: {
      insurances: [],
      insurancePolicyTypes: [],
      insurancePolicySeries: "",
      insurancePolicyNumbers: [],
      unifiedPolicyNumbers: [],
    },
  },
  medicalCaseDetails: {
    medicalCaseDetails: {
      medicalProfiles: [],
      bedProfiles: [],
      division: "",
      encounterMedicalOrganizations: [],
      visitPurposes: [],
      preventiveCarePlaces: [],
      treatmentStartDate: null,
      treatmentEndDate: null,
      diseaseCharacters: [],
      physicianSpecialties: [],
      medicalRecordNumber: "",
    },
    completedCaseDetails: {
      careConditions: [],
      medicalCareTypes: [],
      careForms: [],
      medicalOrganizations: [],
      referringMedicalOrganizations: [],
      treatmentStartDate: null,
      treatmentEndDate: null,
      screeningResults: [],
      hospitalizationOutcomes: [],
      diseaseOutcomes: [],
      paymentMethods: [],
    },
  },
  oncology: {
    oncologyCase: {
      referralReasons: [],
      stages: [],
    },
    oncologyService: {
      drugTherapyCycles: [],
      drugTherapyLines: [],
      radioTherapyTypes: [],
      serviceTypes: [],
      surgicalTreatmentTypes: [],
    },
    medication: {
      drugIdentifiers: [],
      therapyRegimens: [],
    },
  },
  prescription: {
    prescription: {
      referralDate: null,
      referredToMedicalOrganizations: [],
      medicalCareProfiles: [],
      bedProfiles: [],
      services: [],
      diagnosticMethods: [],
      prescriptionTypes: [],
    },
    referral: {
      referralDate: null,
      referredToMedicalOrganizations: [],
      referredServices: [],
      diagnosticMethods: [],
      refferalTypes: [],
    },
  },
  clinicalGroups: {
    clinicalGroups: {
      clinicalStatisticGroupNumbers: [],
      complexityCoefficientNumbers: [],
      interruptedCasePaymentReasons: [],
    },
    highTechMedicalCare: {
      highTechCareTypes: [],
      highTechCareMethods: [],
      plannedAdmissionDates: null,
      voucherIssueDate: null,
      voucherNumber: "",
    },
  },
  providedServices: {
    serviceCodes: [],
  },
  sanction: {
    controlTypeCodes: [],
    expertiseActDate: null,
    expertiseActNumber: "",
    refusalReasons: [],
  },
  diseases: {
    additionalDisease: {
      complicationDiagnoses: [],
      concomitantDiagnoses: [],
      initialDiagnoses: [],
    },
    baseDisease: {
      diagnosisClasses: [],
      diagnosisSubClasses: [],
      primaryDiagnoses: [],
    },
  },
  inrernalService: {
    completedCaseUid: "",
    medicalCaseUid: "",
    patientUid: "",
    invoiceUid: "",
    invoiceNumber: "",
    invoiceBillingMonth: "",
    invoiceBillingYear: "",
  },
};
