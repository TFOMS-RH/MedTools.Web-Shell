export interface GetDiagnosticsResult {
  diagnostics: DiagnosticListItemDto[];
}

export interface DiagnosticListItemDto {
  diagnosticsUid: number;
  specimenCollectionDate: string | null;
  diagnosticTypeCode: number | null;
  diagnosticTypeName: string | null;
  diagnosticCode: number | null;
  diagnosticName: string | null;
  diagnosticResultCode: number | null;
  diagnosticResultName: string | null;
  isResultReceived: boolean | null;
}
