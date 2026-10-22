export const resolveCurrentModule = (pathname: string): string => {
  const moduleMap: Record<string, string> = {
    "/med-view": "MedView",
    "/rcontrol": "RControl",
    "/health-track": "HealthTrack",
    "/admin/users": "Администрирование",
  };

  return moduleMap[pathname] ?? "";
};
