export interface ruleType {
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

type rulesType = Array<ruleType>

export default rulesType;
