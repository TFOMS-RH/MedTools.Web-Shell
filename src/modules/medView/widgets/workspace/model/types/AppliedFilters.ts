export interface AppliedFilters {
  person: AppliedPersonFilters;
  medicalCaseDetails: AppliedMedicalCaseDetailsFilters;
  oncology: AppliedOncologyFilters;
  prescription: AppliedPrescriptionFilters;
  clinicalGroup: AppliedClinicalGroupsFilters;
  providedService: AppliedProvidedServicesFilters;
  sanction: AppliedSanctionFilters;
  diseases: AppliedDiseaseFilters;
  internalService: AppliedInternalServiceFilters;
}

interface AppliedDiseaseFilters {
  additionalDisease: AppliedAdditionalDiseaseFilters;
  baseDisease: AppliedBaseDiseaseFilters;
}

interface AppliedAdditionalDiseaseFilters {
  initialDiagnoses: string[];
  concomitantDiagnoses: string[];
  complicationDiagnoses: string[];
}

interface AppliedBaseDiseaseFilters {
  primaryDiagnoses: string[];
  diagnosisClasses: number[];
  diagnosisSubClasses: number[];
}

interface AppliedInternalServiceFilters {
  patientUid: string;
  medicalCaseUid: string;
  completedCaseUid: string;
  invoiceUid: string;
  invoiceNumber: string;
  invoiceBillingMonth: string;
  invoiceBillingYear: string;
}

interface AppliedSanctionFilters {
  controlTypeCodes: string[];
  refusalReasons: string[];
  expertiseActNumber: string;
  expertiseActDate: string | null;
}

interface AppliedProvidedServicesFilters {
  providedServices: string[];
}

interface AppliedClinicalGroupsFilters {
  baseClinicalGroup: AppliedBaseClinicalGroupsFilters;
  highTechMedicalCare: AppliedHighTechMedicalCareFilters;
}

interface AppliedBaseClinicalGroupsFilters {
  clinicalStatisticGroupNumbers: string[];
  interruptedCasePaymentReasons: string[];
  complexityCoefficientNumbers: string[];
}

interface AppliedHighTechMedicalCareFilters {
  highTechCareTypes: string[];
  highTechCareMethods: string[];
  voucherIssueDate: string | null;
  voucherNumber: string;
  plannedAdmissionDate: string | null;
}

interface AppliedPrescriptionFilters {
  basePrescription: AppliedBasePrescriptionFilters;
  referral: AppliedReferralFilters;
}

interface AppliedBasePrescriptionFilters {
  prescriptionTypes: string[];
  diagnosticMethods: string[];
  services: string[];
  referralDate: string | null;
  referredToMedicalOrganizations: string[];
  medicalCareProfiles: number[];
  bedProfiles: string[];
}

interface AppliedReferralFilters {
  referralDate: string | null;
  referredToMedicalOrganizations: string[];
  referralTypes: number[];
  diagnosticMethods: number[];
  referredServices: string[];
}

interface AppliedOncologyFilters {
  oncologyCase: AppliedOncologyCaseFilters;
  medication: AppliedMedicationFilters;
  oncologyService: AppliedOncologyServiceFilters;
}

interface AppliedOncologyCaseFilters {
  referralReasons: string[];
  stages: string[];
}

interface AppliedMedicationFilters {
  drugIdentifiers: string[];
  therapyRegimens: string[];
}

interface AppliedOncologyServiceFilters {
  serviceTypes: string[];
  surgicalTreatmentTypes: string[];
  drugTherapyLines: string[];
  drugTherapyCycles: string[];
  radioTherapyTypes: string[];
}

interface AppliedMedicalCaseDetailsFilters {
  baseMedicalCaseDetails: AppliedBaseMedicalCaseDetailsFilters;
  completedCaseDetails: AppliedCompletedCaseDetailsFilters;
}

interface AppliedBaseMedicalCaseDetailsFilters {
  medicalProfiles: number[];
  bedProfiles: number[];
  division: string;
  encounterMedicalOrganizations: string[];
  visitPurposes: string[];
  preventiveCarePlaces: number[];
  treatmentStartDate: string | null;
  treatmentEndDate: string | null;
  diseaseCharacters: number[];
  physicianSpecialties: number[];
  medicalRecordNumber: string;
}

interface AppliedCompletedCaseDetailsFilters {
  careConditions: number[];
  medicalCareTypes: number[];
  careForms: number[];
  medicalOrganizations: string[];
  referringMedicalOrganizations: string[];
  treatmentStartDate: string | null;
  treatmentEndDate: string | null;
  screeningResults: string[];
  hospitalizationOutcomes: number[];
  diseaseOutcomes: number[];
  paymentMethods: number[];
}

interface AppliedPersonFilters {
  patient: AppliedPatientFilters;
  representative: AppliedRepresentativeFilters;
  insurance: AppliedInsuranceFilters;
}

interface AppliedPatientFilters {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string | null;
  sex: string | null;
}

interface AppliedRepresentativeFilters {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string | null;
  sex: string | null;
}

interface AppliedInsuranceFilters {
  insurances: string[];
  insurancePolicyTypes: string[];
  insurancePolicySeries: string;
  insurancePolicyNumbers: string[];
  unifiedPolicyNumbers: string[];
}
