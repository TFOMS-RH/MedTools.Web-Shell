import { Tab, Tabs } from "@mui/material";
import type { ReactElement } from "react";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";

import styles from "./styles.module.scss";

export type HTTabKey = "documents" | "import" | "registerDn" | "statistics";

interface HTTabDefinition {
  key: HTTabKey;
  title: string;
  icon: ReactElement;
}

const TABS: HTTabDefinition[] = [
  {
    key: "documents",
    title: "Документы и экспорт",
    icon: <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />,
  },
  {
    key: "import",
    title: "Импорт",
    icon: <UploadFileOutlinedIcon sx={{ fontSize: 20 }} />,
  },
  {
    key: "registerDn",
    title: "Регистр ДН",
    icon: <AssignmentOutlinedIcon sx={{ fontSize: 20 }} />,
  },
  {
    key: "statistics",
    title: "Статистика",
    icon: <BarChartOutlinedIcon sx={{ fontSize: 20 }} />,
  },
];

interface HTTabCardsProps {
  activeTab: HTTabKey;
  onTabChange: (key: HTTabKey) => void;
}


export const HTTabCards = ({ activeTab, onTabChange }: HTTabCardsProps) => (
  <Tabs className={styles.tabsRoot} value={activeTab}
    onChange={(_, key: HTTabKey) => onTabChange(key)}
    variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
    aria-label="Разделы HealthTrack">
    {TABS.map((tab) => <Tab key={tab.key} value={tab.key} label={tab.title}
      icon={tab.icon} iconPosition="start" disableRipple
      id={"ht-section-tab-" + tab.key} aria-controls="ht-section-panel" />)}
  </Tabs>
);
