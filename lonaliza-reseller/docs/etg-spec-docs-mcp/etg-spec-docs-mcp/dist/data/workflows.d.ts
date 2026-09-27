export interface IntegrationWorkflow {
    id: string;
    title: string;
    description: string;
    steps: {
        stepNumber: number;
        action: string;
        endpoint: string;
        description: string;
        criticalNotes: string[];
    }[];
    codeArchitectureGuidelines: string[];
}
export declare const WORKFLOWS: Record<string, IntegrationWorkflow>;
