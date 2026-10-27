import type { AppliedFilters } from "../types/AppliedFilters";
import type { FiltersDraft } from "../types/FiltersDraft";
import { mapDate } from "./mapDate";

export const mapFiltersDraftToApplied = (
  draft: FiltersDraft,
): AppliedFilters => {
  const appliedFilters: AppliedFilters = {
    person: {
      patient: {
        firstName: draft.person.patient.firstName,
        lastName: draft.person.patient.lastName,
        middleName: draft.person.patient.middleName,
        sex: draft.person.patient.sex,
        birthDate: mapDate(draft.person.patient.birthDate),
      },
      representative: {
        firstName: draft.person.representative.firstName,
        lastName: draft.person.representative.lastName,
        middleName: draft.person.representative.middleName,
        sex: draft.person.representative.sex,
        birthDate: mapDate(draft.person.representative.birthDate),
      },
      insurance: {
        insurances: draft.person.insurance.insurances,
        insurancePolicyNumbers: draft.person.insurance.insurancePolicyNumbers,
        insurancePolicySeries: draft.person.insurance.insurancePolicySeries,
        insurancePolicyTypes: draft.person.insurance.insurancePolicyTypes,
        unifiedPolicyNumbers: draft.person.insurance.unifiedPolicyNumbers,
      },
    },
    medicalCaseDetails: {
      baseMedicalCaseDetails: {
        bedProfiles:
          draft.medicalCaseDetails.medicalCaseDetails.bedProfiles.map(
            (bedProfile) => parseInt(bedProfile),
          ),
        diseaseCharacters:
          draft.medicalCaseDetails.medicalCaseDetails.diseaseCharacters.map(
            (diseaseCharacter) => parseInt(diseaseCharacter),
          ),
        division: draft.medicalCaseDetails.medicalCaseDetails.division,
        encounterMedicalOrganizations:
          draft.medicalCaseDetails.medicalCaseDetails
            .encounterMedicalOrganizations,
        medicalProfiles:
          draft.medicalCaseDetails.medicalCaseDetails.medicalProfiles.map(
            (medicalProfile) => parseInt(medicalProfile),
          ),
        medicalRecordNumber:
          draft.medicalCaseDetails.medicalCaseDetails.medicalRecordNumber,
        physicianSpecialties:
          draft.medicalCaseDetails.medicalCaseDetails.physicianSpecialties.map(
            (physicianSpeicality) => parseInt(physicianSpeicality),
          ),
        preventiveCarePlaces:
          draft.medicalCaseDetails.medicalCaseDetails.preventiveCarePlaces.map(
            (preventiveCarePlace) => parseInt(preventiveCarePlace),
          ),
        treatmentEndDate: mapDate(
          draft.medicalCaseDetails.medicalCaseDetails.treatmentEndDate,
        ),
        treatmentStartDate: mapDate(
          draft.medicalCaseDetails.medicalCaseDetails.treatmentStartDate,
        ),
        visitPurposes:
          draft.medicalCaseDetails.medicalCaseDetails.visitPurposes,
      },
      completedCaseDetails: {
        careConditions:
          draft.medicalCaseDetails.completedCaseDetails.careConditions.map(
            (careCondition) => parseInt(careCondition),
          ),
        careForms: draft.medicalCaseDetails.completedCaseDetails.careForms.map(
          (careForm) => parseInt(careForm),
        ),
        diseaseOutcomes:
          draft.medicalCaseDetails.completedCaseDetails.diseaseOutcomes.map(
            (diseaseOutcome) => parseInt(diseaseOutcome),
          ),
        hospitalizationOutcomes:
          draft.medicalCaseDetails.completedCaseDetails.hospitalizationOutcomes.map(
            (hospitalizationOutcome) => parseInt(hospitalizationOutcome),
          ),
        medicalCareTypes:
          draft.medicalCaseDetails.completedCaseDetails.medicalCareTypes.map(
            (medicalCareType) => parseInt(medicalCareType),
          ),
        medicalOrganizations:
          draft.medicalCaseDetails.completedCaseDetails.medicalOrganizations,
        paymentMethods:
          draft.medicalCaseDetails.completedCaseDetails.paymentMethods.map(
            (paymentMethod) => parseInt(paymentMethod),
          ),
        referringMedicalOrganizations:
          draft.medicalCaseDetails.completedCaseDetails
            .referringMedicalOrganizations,
        screeningResults:
          draft.medicalCaseDetails.completedCaseDetails.screeningResults,
        treatmentEndDate: mapDate(
          draft.medicalCaseDetails.completedCaseDetails.treatmentEndDate,
        ),
        treatmentStartDate: mapDate(
          draft.medicalCaseDetails.completedCaseDetails.treatmentStartDate,
        ),
      },
    },
    oncology: {
      oncologyCase: {
        stages: draft.oncology.oncologyCase.stages.map((x) => x.value),
        referralReasons: draft.oncology.oncologyCase.referralReasons,
      },
      oncologyService: {
        drugTherapyCycles: draft.oncology.oncologyService.drugTherapyCycles,
        drugTherapyLines: draft.oncology.oncologyService.drugTherapyLines,
        radioTherapyTypes: draft.oncology.oncologyService.radioTherapyTypes,
        serviceTypes: draft.oncology.oncologyService.serviceTypes,
        surgicalTreatmentTypes:
          draft.oncology.oncologyService.surgicalTreatmentTypes,
      },
      medication: {
        drugIdentifiers: draft.oncology.medication.drugIdentifiers.map(
          (x) => x.value,
        ),
        therapyRegimens: draft.oncology.medication.therapyRegimens.map(
          (x) => x.value,
        ),
      },
    },
    prescription: {
      basePrescription: {
        bedProfiles: draft.prescription.prescription.bedProfiles,
        diagnosticMethods: draft.prescription.prescription.diagnosticMethods,
        medicalCareProfiles:
          draft.prescription.prescription.medicalCareProfiles.map(
            (medicalCareProfile) => parseInt(medicalCareProfile),
          ),
        prescriptionTypes: draft.prescription.prescription.prescriptionTypes,
        referralDate: mapDate(draft.prescription.prescription.referralDate),
        referredToMedicalOrganizations:
          draft.prescription.prescription.referredToMedicalOrganizations,
        services: draft.prescription.prescription.services.map((x) => x.value),
      },
      referral: {
        diagnosticMethods: draft.prescription.referral.diagnosticMethods.map(
          (method) => parseInt(method),
        ),
        referralDate: mapDate(draft.prescription.referral.referralDate),
        referralTypes: draft.prescription.referral.refferalTypes.map(
          (referralType) => parseInt(referralType),
        ),
        referredServices: draft.prescription.referral.referredServices.map(
          (x) => x.value,
        ),
        referredToMedicalOrganizations:
          draft.prescription.referral.referredToMedicalOrganizations,
      },
    },
    clinicalGroup: {
      baseClinicalGroup: {
        clinicalStatisticGroupNumbers:
          draft.clinicalGroups.clinicalGroups.clinicalStatisticGroupNumbers.map(
            (x) => x.value,
          ),
        complexityCoefficientNumbers:
          draft.clinicalGroups.clinicalGroups.complexityCoefficientNumbers,
        interruptedCasePaymentReasons:
          draft.clinicalGroups.clinicalGroups.interruptedCasePaymentReasons,
      },
      highTechMedicalCare: {
        highTechCareMethods:
          draft.clinicalGroups.highTechMedicalCare.highTechCareMethods.map(
            (x) => x.value,
          ),
        highTechCareTypes:
          draft.clinicalGroups.highTechMedicalCare.highTechCareTypes.map(
            (x) => x.value,
          ),
        plannedAdmissionDate: mapDate(
          draft.clinicalGroups.highTechMedicalCare.plannedAdmissionDates,
        ),
        voucherIssueDate: mapDate(
          draft.clinicalGroups.highTechMedicalCare.voucherIssueDate,
        ),
        voucherNumber: draft.clinicalGroups.highTechMedicalCare.voucherNumber,
      },
    },
    providedService: {
      providedServices: draft.providedServices.serviceCodes.map((x) => x.value),
    },
    sanction: {
      controlTypeCodes: draft.sanction.controlTypeCodes,
      expertiseActDate: mapDate(draft.sanction.expertiseActDate),
      expertiseActNumber: draft.sanction.expertiseActNumber,
      refusalReasons: draft.sanction.refusalReasons.map((x) => x.value),
    },
    diseases: {
      additionalDisease: {
        initialDiagnoses: draft.diseases.additionalDisease.initialDiagnoses.map(
          (initial) => initial.value,
        ),
        complicationDiagnoses:
          draft.diseases.additionalDisease.complicationDiagnoses.map(
            (complication) => complication.value,
          ),
        concomitantDiagnoses:
          draft.diseases.additionalDisease.concomitantDiagnoses.map(
            (concomitant) => concomitant.value,
          ),
      },
      baseDisease: {
        diagnosisClasses: draft.diseases.baseDisease.diagnosisClasses.map(
          (diagClass) => parseInt(diagClass),
        ),
        diagnosisSubClasses: draft.diseases.baseDisease.diagnosisSubClasses.map(
          (diagSubClass) => parseInt(diagSubClass),
        ),
        primaryDiagnoses: draft.diseases.baseDisease.primaryDiagnoses.map(
          (primary) => primary.value,
        ),
      },
    },
    internalService: {
      completedCaseUid: draft.inrernalService.completedCaseUid,
      medicalCaseUid: draft.inrernalService.medicalCaseUid,
      patientUid: draft.inrernalService.patientUid,
      invoiceUid: draft.inrernalService.invoiceUid,
      invoiceNumber: draft.inrernalService.invoiceNumber,
      invoiceBillingMonth: draft.inrernalService.invoiceBillingMonth,
      invoiceBillingYear: draft.inrernalService.invoiceBillingYear,
    },
  };

  return appliedFilters;
};
