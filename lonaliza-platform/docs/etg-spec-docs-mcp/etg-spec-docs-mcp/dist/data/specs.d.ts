export interface EndpointSpec {
    id: string;
    name: string;
    category: 'Search' | 'Prebook' | 'Booking' | 'PostBooking' | 'Content';
    path: string;
    method: 'POST' | 'GET';
    description: string;
    authentication: string;
    requiredHeaders: Record<string, string>;
    requestSchema: Record<string, any>;
    responseSchema: Record<string, any>;
    sampleRequest: Record<string, any>;
    sampleResponse: Record<string, any>;
    businessRules: string[];
}
export declare const ENDPOINT_SPECS: Record<string, EndpointSpec>;
