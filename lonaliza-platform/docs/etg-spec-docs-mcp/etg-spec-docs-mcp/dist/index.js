#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { DOCS_TOOLS } from './tools.js';
import { ENDPOINT_SPECS } from './data/specs.js';
import { WORKFLOWS } from './data/workflows.js';
const server = new Server({
    name: 'etg-docs-spec-server',
    version: '1.0.0'
}, {
    capabilities: {
        tools: {},
        resources: {}
    }
});
// Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: 'docs://etg/overview',
                name: 'ETG API v3 Architecture Overview',
                mimeType: 'text/markdown'
            },
            {
                uri: 'docs://etg/booking-workflow',
                name: 'ETG Mandatory Booking Workflow',
                mimeType: 'text/markdown'
            },
            {
                uri: 'docs://etg/error-catalog',
                name: 'ETG Error Catalog & Retry Rules',
                mimeType: 'text/markdown'
            }
        ]
    };
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    if (uri === 'docs://etg/overview') {
        return {
            contents: [
                {
                    uri,
                    mimeType: 'text/markdown',
                    text: `# Emerging Travel Group (RateHawk / ETG API v3)
Base URL Production: https://api.ratehawk.com
Base URL Sandbox: https://api-sandbox.ratehawk.com
Auth: HTTP Basic Auth using KEY_ID:API_KEY
Format: JSON POST requests.
Workflow: SERP -> Hotelpage -> Prebook -> Booking Form -> Booking Finish -> Status Check.`
                }
            ]
        };
    }
    if (uri === 'docs://etg/booking-workflow') {
        return {
            contents: [
                {
                    uri,
                    mimeType: 'text/markdown',
                    text: JSON.stringify(WORKFLOWS.full_booking_lifecycle, null, 2)
                }
            ]
        };
    }
    throw new Error(`Resource not found: ${uri}`);
});
// Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: DOCS_TOOLS };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const payload = args || {};
    try {
        switch (name) {
            case 'etg_get_endpoint_spec': {
                const spec = ENDPOINT_SPECS[payload.endpoint_id];
                if (!spec) {
                    throw new Error(`Endpoint '${payload.endpoint_id}' not found. Available endpoints: ${Object.keys(ENDPOINT_SPECS).join(', ')}`);
                }
                return {
                    content: [{ type: 'text', text: JSON.stringify(spec, null, 2) }]
                };
            }
            case 'etg_get_mock_payload': {
                const spec = ENDPOINT_SPECS[payload.endpoint_id];
                if (!spec) {
                    throw new Error(`Endpoint '${payload.endpoint_id}' not found.`);
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                endpoint: spec.path,
                                method: spec.method,
                                mockRequest: spec.sampleRequest,
                                mockResponse: spec.sampleResponse
                            }, null, 2)
                        }
                    ]
                };
            }
            case 'etg_get_integration_workflow': {
                const workflow = WORKFLOWS[payload.workflow_id];
                if (!workflow) {
                    throw new Error(`Workflow '${payload.workflow_id}' not found. Available: full_booking_lifecycle, cancellation_lifecycle`);
                }
                return {
                    content: [{ type: 'text', text: JSON.stringify(workflow, null, 2) }]
                };
            }
            case 'etg_search_docs': {
                const q = (payload.query || '').toLowerCase();
                const results = [];
                for (const [key, spec] of Object.entries(ENDPOINT_SPECS)) {
                    if (spec.name.toLowerCase().includes(q) ||
                        spec.description.toLowerCase().includes(q) ||
                        spec.path.toLowerCase().includes(q) ||
                        spec.businessRules.some((r) => r.toLowerCase().includes(q))) {
                        results.push({
                            type: 'endpoint',
                            id: key,
                            name: spec.name,
                            path: spec.path,
                            matchingRules: spec.businessRules
                        });
                    }
                }
                return {
                    content: [{ type: 'text', text: JSON.stringify({ query: payload.query, matches: results }, null, 2) }]
                };
            }
            case 'etg_generate_service_template': {
                const templateCode = `// Production TypeScript Service Interface for ETG API v3
export interface EtgConfig {
  keyId: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
}

export class EtgIntegrationService {
  constructor(private config: EtgConfig) {}

  // 1. Search SERP
  async searchHotels(params: any): Promise<any> { /* POST /api/b2b/v3/search/serp/region/ */ }

  // 2. Hotelpage
  async getHotelRates(hotelId: string, params: any): Promise<any> { /* POST /api/b2b/v3/search/hp/ */ }

  // 3. Prebook
  async validateRate(bookHash: string, tolerancePercent: number = 0): Promise<any> { /* POST /api/b2b/v3/hotel/prebook/ */ }

  // 4. Booking
  async createBookingOrder(orderPayload: any): Promise<any> { /* Form + Finish steps */ }

  // 5. Polling
  async pollOrderStatus(partnerOrderId: string): Promise<any> { /* Polling /finish/status/ */ }
}`;
                return {
                    content: [{ type: 'text', text: templateCode }]
                };
            }
            default:
                throw new Error(`Unsupported tool: ${name}`);
        }
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: 'text', text: error.message || 'Error executing docs tool.' }]
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('ETG Documentation & Spec MCP Server running on stdio');
}
main().catch((err) => {
    console.error('Fatal error in ETG Docs MCP server:', err);
    process.exit(1);
});
