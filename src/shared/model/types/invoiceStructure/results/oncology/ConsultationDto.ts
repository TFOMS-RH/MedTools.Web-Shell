export interface ConsultationDto {
  consultationUid: number;
  consultationPurposeCode: number;
  consultationPurpose: string;
  consultationDate: string | null;
}
