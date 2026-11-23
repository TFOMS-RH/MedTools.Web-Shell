import { replaceEqualDeep } from "@tanstack/react-query";
import type { FilterGroupId } from "../../workspace/model/types/FilterId";
import {
  initialFiltersDraft,
  type FiltersDraft,
} from "../../workspace/model/types/FiltersDraft";

export const filterGroups = {
  persons: {
    draftKey: "person",
    label: "Персональные данные",
    title: "Персональные данные",
    description: "Пациент, представитель и сведения о страховании",
  },
  "case-details": {
    draftKey: "medicalCaseDetails",
    label: "Детали медицинского случая",
    title: "Фильтрация по медицинскому случаю",
    description:
      "Все поля, которые относятся к данным по медицинскому и законченному случаям",
  },
  oncology: {
    draftKey: "oncology",
    label: "Онкология",
    title: "Фильтрация по онкологии",
    description: "Все поля, которые относятся к онкологии",
  },
  prescriptions: {
    draftKey: "prescription",
    label: "Назначения и направления",
    title: "Фильтрация по назначениям и направлениям",
    description: "Все поля, которые относятся к назначениям и направлениям",
  },
  "clinical-groups": {
    draftKey: "clinicalGroups",
    label: "Клинические группы и ВМП",
    title: "Фильтрация по клиническим группам",
    description: "Все поля, которые относятся к КСГ и ВМП случаям",
  },
  "provided-services": {
    draftKey: "providedServices",
    label: "Оказанные услуги",
    title: "Фильтрация по услугам",
    description: "Все поля, которые относятся к услугам",
  },
  sanctions: {
    draftKey: "sanction",
    label: "Санкции",
    title: "Фильтрация по санкциям",
    description: "Все поля, которые относятся к санкциям",
  },
  ICD: {
    draftKey: "diseases",
    label: "МКБ",
    title: "Фильтрация по заболеваниям",
    description: "Все поля, которые относятся к заболеваниям",
  },
  "internal-service": {
    draftKey: "inrernalService",
    label: "Служебная информация",
    title: "Фильтрация по техническим полям",
    description: "Все, что относится к техническим полям",
  },
} satisfies Record<
  FilterGroupId,
  {
    draftKey: keyof FiltersDraft;
    label: string;
    title: string;
    description: string;
  }
>;

export const filterGroupIds = Object.keys(filterGroups) as FilterGroupId[];

export const hasFilterChanges = (
  draft: FiltersDraft,
  groupId?: FilterGroupId,
): boolean => {
  if (groupId === undefined) {
    return replaceEqualDeep(initialFiltersDraft, draft) !== initialFiltersDraft;
  }

  const key = filterGroups[groupId].draftKey;
  const initialValue = initialFiltersDraft[key];
  return replaceEqualDeep(initialValue, draft[key]) !== initialValue;
};

export const resetFiltersDraft = (
  draft: FiltersDraft,
  groupId?: FilterGroupId,
): FiltersDraft => {
  if (!hasFilterChanges(draft, groupId)) return draft;

  if (groupId === undefined) return structuredClone(initialFiltersDraft);

  const key = filterGroups[groupId].draftKey;
  return { ...draft, [key]: structuredClone(initialFiltersDraft[key]) };
};
