interface TokenClaims {
  permissions: string[];
  expiresAt: number;
  organizationType: number | null;
  organizationCode: string | null;
}

// Only UI hints. The API verifies the JWT signature and enforces permissions.
export const readTokenClaims = (token: string): TokenClaims | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const encoded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(encoded), (character) =>
      character.charCodeAt(0),
    );
    const claims: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (
      !claims ||
      typeof claims !== "object" ||
      !("exp" in claims) ||
      typeof claims.exp !== "number" ||
      !Number.isFinite(claims.exp)
    )
      return null;

    const permission = "permission" in claims ? claims.permission : [];
    const permissions =
      typeof permission === "string"
        ? [permission]
        : Array.isArray(permission)
          ? permission.filter(
              (value): value is string => typeof value === "string",
            )
          : [];

    let organizationType: number | null = null;
    if ("organization_type" in claims) {
      const val = claims.organization_type;
      if (typeof val === "number") {
        organizationType = val;
      } else if (typeof val === "string") {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) organizationType = parsed;
      }
    }

    let organizationCode: string | null = null;
    if ("organization_code" in claims && typeof claims.organization_code === "string") {
      organizationCode = claims.organization_code;
    }

    return { 
      permissions, 
      expiresAt: claims.exp * 1000,
      organizationType,
      organizationCode
    };
  } catch {
    return null;
  }
};
