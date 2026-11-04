export interface HTProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  errors?: string[];
  traceId?: string;
}

export const isHTProblemDetails = (
  value: unknown,
): value is HTProblemDetails => {
  return (
    typeof value === "object" &&
    value !== null &&
    ("title" in value || "errors" in value)
  );
};