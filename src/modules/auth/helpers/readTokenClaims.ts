interface TokenClaims {
  permissions: string[];
  expiresAt: number;
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

    return { permissions, expiresAt: claims.exp * 1000 };
  } catch {
    return null;
  }
};
