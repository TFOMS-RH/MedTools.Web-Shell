export interface PatientDto {
  patientLastName: string;
  patientFirstName: string;
  patientMiddleName: string;
  patientBirthDate: string;
  patientSex: string;
  documentTypeName: string;
  documentTypeCode: string | null;
  documentSeries: string | null;
  documentNumber: string | null;
  documentIssueDate: string | null;
  issuedBy: string | null;
  patientRepresentativeLastName: string | null;
  patientRepresentativeFirstName: string | null;
  patientRepresentativeMiddleName: string | null;
  patientRepresentativeBirthday: string | null;
  patientRepresentativeSex: string | null;
}
