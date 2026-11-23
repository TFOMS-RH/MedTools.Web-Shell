import { createContext, useContext, useState } from "react";

export const MedViewFilterInputReset = createContext(0);

// Keep search state local while allowing a form reset without remounting its queries.
export const useMedViewFilterSearch = () => {
  const resetVersion = useContext(MedViewFilterInputReset);
  const [search, setSearch] = useState({ resetVersion, value: "" });

  return [
    search.resetVersion === resetVersion ? search.value : "",
    (value: string) => setSearch({ resetVersion, value }),
  ] as const;
};
