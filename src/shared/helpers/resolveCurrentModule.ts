export const resolveCurrentModule = (pathname: string): string => {
  const moduleMap: Record<string, string> = {
    "/med-view": "MedView",
    "/rcontrol": "RControl",
    "/health-track": "HealthTrack",
    "/admin/users": "Администрирование",
    "/admin/roles": "Администрирование",
    "/admin/permissions": "Администрирование",
  };

  return moduleMap[pathname] ?? "";
};
