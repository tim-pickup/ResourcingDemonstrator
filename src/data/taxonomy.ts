import { Theme } from '../types';

export const THEMES: Theme[] = [
  {
    id: "MOM",
    name: "Manufacturing Operations Management",
    shortName: "MOM",
    skills: [
      { id: "MOM-01", name: "MES Design & Configuration", themeId: "MOM" },
      { id: "MOM-02", name: "Production Scheduling & Planning (APS)", themeId: "MOM" },
      { id: "MOM-03", name: "Quality Management (QMS / SPC)", themeId: "MOM" },
      { id: "MOM-04", name: "Material & Inventory Operations", themeId: "MOM" },
      { id: "MOM-05", name: "Maintenance Operations Integration", themeId: "MOM" },
      { id: "MOM-06", name: "MOM/MES Integration & Architecture", themeId: "MOM" },
      { id: "MOM-07", name: "Recipe & Process Management", themeId: "MOM" },
      { id: "MOM-08", name: "Compliance & Electronic Records (GxP/eDHR)", themeId: "MOM" },
    ],
  },
  {
    id: "MIV",
    name: "Manufacturing Intelligence & Visualisation",
    shortName: "MI&V",
    skills: [
      { id: "MIV-01", name: "Data Historian & Time-Series Management", themeId: "MIV" },
      { id: "MIV-02", name: "Data Contextualisation & Modelling", themeId: "MIV" },
      { id: "MIV-03", name: "Industrial Connectivity & Data Acquisition", themeId: "MIV" },
      { id: "MIV-04", name: "KPI Design & OEE Management", themeId: "MIV" },
      { id: "MIV-05", name: "Dashboard & Visualisation Development", themeId: "MIV" },
      { id: "MIV-06", name: "Statistical Process Control (SPC) & Process Analytics", themeId: "MIV" },
      { id: "MIV-07", name: "Manufacturing Data Integration & ETL", themeId: "MIV" },
      { id: "MIV-08", name: "Advanced Analytics & AI/ML for Manufacturing", themeId: "MIV" },
    ],
  },
];
