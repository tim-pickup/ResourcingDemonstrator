import { TeamMember, ProficiencyLevel } from '../types';

export const TEAM_MEMBERS: TeamMember[] = [
  // 6 primarily MOM
  {
    id: "TM-01",
    name: "James Hartley",
    initials: "JH",
    roleTitle: "Digital Manufacturing Specialist",
    skills: [
      { skillId: "MOM-01", level: ProficiencyLevel.Lead },
      { skillId: "MOM-06", level: ProficiencyLevel.Specialist },
      { skillId: "MOM-05", level: ProficiencyLevel.Practitioner },
    ],
  },
  {
    id: "TM-02",
    name: "Priya Nair",
    initials: "PN",
    roleTitle: "Digital Manufacturing Specialist",
    skills: [
      { skillId: "MOM-06", level: ProficiencyLevel.Specialist },
      { skillId: "MOM-01", level: ProficiencyLevel.Practitioner },
      { skillId: "MOM-07", level: ProficiencyLevel.Practitioner },
    ],
  },
  {
    id: "TM-03",
    name: "Oliver Bennett",
    initials: "OB",
    roleTitle: "Digital Manufacturing Engineer",
    skills: [
      { skillId: "MOM-02", level: ProficiencyLevel.Practitioner },
      { skillId: "MOM-04", level: ProficiencyLevel.Practitioner },
      { skillId: "MOM-03", level: ProficiencyLevel.Awareness },
    ],
  },
  {
    id: "TM-04",
    name: "Fatima Al-Hassan",
    initials: "FA",
    roleTitle: "Digital Manufacturing Engineer",
    skills: [
      { skillId: "MOM-08", level: ProficiencyLevel.Specialist },
      { skillId: "MOM-03", level: ProficiencyLevel.Practitioner },
      { skillId: "MOM-07", level: ProficiencyLevel.Awareness },
    ],
  },
  {
    id: "TM-05",
    name: "Lucas Ferreira",
    initials: "LF",
    roleTitle: "Digital Manufacturing Engineer",
    skills: [
      { skillId: "MOM-07", level: ProficiencyLevel.Specialist },
      { skillId: "MOM-02", level: ProficiencyLevel.Practitioner },
      { skillId: "MOM-05", level: ProficiencyLevel.Awareness },
    ],
  },
  {
    id: "TM-06",
    name: "Amelia Thornton",
    initials: "AT",
    roleTitle: "Digital Manufacturing Engineer",
    skills: [
      { skillId: "MOM-03", level: ProficiencyLevel.Practitioner },
      { skillId: "MOM-08", level: ProficiencyLevel.Practitioner },
      { skillId: "MOM-04", level: ProficiencyLevel.Awareness },
    ],
  },
  // 4 primarily MI&V
  {
    id: "TM-07",
    name: "Sophie Müller",
    initials: "SM",
    roleTitle: "Digital Manufacturing Specialist",
    skills: [
      { skillId: "MIV-01", level: ProficiencyLevel.Lead },
      { skillId: "MIV-03", level: ProficiencyLevel.Specialist },
      { skillId: "MIV-07", level: ProficiencyLevel.Practitioner },
    ],
  },
  {
    id: "TM-08",
    name: "Raj Krishnamurthy",
    initials: "RK",
    roleTitle: "Digital Manufacturing Specialist",
    skills: [
      { skillId: "MIV-04", level: ProficiencyLevel.Lead },
      { skillId: "MIV-05", level: ProficiencyLevel.Specialist },
      { skillId: "MIV-06", level: ProficiencyLevel.Practitioner },
    ],
  },
  {
    id: "TM-09",
    name: "Chloe Dupont",
    initials: "CD",
    roleTitle: "Digital Manufacturing Engineer",
    skills: [
      { skillId: "MIV-05", level: ProficiencyLevel.Practitioner },
      { skillId: "MIV-02", level: ProficiencyLevel.Practitioner },
      { skillId: "MIV-04", level: ProficiencyLevel.Awareness },
    ],
  },
  {
    id: "TM-10",
    name: "Noah Adeyemi",
    initials: "NA",
    roleTitle: "Digital Manufacturing Engineer",
    skills: [
      { skillId: "MIV-08", level: ProficiencyLevel.Practitioner },
      { skillId: "MIV-07", level: ProficiencyLevel.Practitioner },
      { skillId: "MIV-02", level: ProficiencyLevel.Awareness },
    ],
  },
  // 2 cross-theme
  {
    id: "TM-11",
    name: "Isabel Rodrigues",
    initials: "IR",
    roleTitle: "Digital Manufacturing Specialist",
    skills: [
      { skillId: "MOM-06", level: ProficiencyLevel.Lead },
      { skillId: "MIV-03", level: ProficiencyLevel.Specialist },
      { skillId: "MOM-01", level: ProficiencyLevel.Practitioner },
      { skillId: "MIV-07", level: ProficiencyLevel.Practitioner },
    ],
  },
  {
    id: "TM-12",
    name: "Daniel Park",
    initials: "DP",
    roleTitle: "Digital Manufacturing Engineer",
    skills: [
      { skillId: "MOM-05", level: ProficiencyLevel.Practitioner },
      { skillId: "MIV-01", level: ProficiencyLevel.Practitioner },
      { skillId: "MOM-04", level: ProficiencyLevel.Awareness },
      { skillId: "MIV-04", level: ProficiencyLevel.Awareness },
    ],
  },
];
