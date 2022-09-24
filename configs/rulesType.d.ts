export interface ruleType {
  ruleNumber: number;
  shortDesc: string;
  description: string;
  extended: {
    shortDesc: string;
    description: string;
    active: boolean;
  }[];
  extraCategories?: string[];
  active: boolean;
}

export default interface rulesType {
  [key: string]: ruleType;
}
