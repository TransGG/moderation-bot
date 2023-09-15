export interface templateType {
    description: string;
    category: string[];
    action: string;
    reason: string;
    rule: string;
    duration?: string;
}

export default interface templatesType {
    [key: string]: templateType;
}
