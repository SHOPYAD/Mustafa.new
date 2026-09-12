import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ENDPOINT_SPECS } from './data/specs.js';
import { WORKFLOWS } from './data/workflows.js';

export const DOCS_TOOLS: Tool[] = [
  {
    name: 'etg_get_endpoint_spec',
    description: 'Returns the exact specification of any ETG API endpoint: HTTP method, URL path, headers, request schema, response schema, and parameter constraints.',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint_id: {
          type: 'string',
          enum: [
            'search_by_region',
            'retrieve_hotelpage',
            'prebook_rate',
            'create_booking_form',
            'start_booking_finish',
            'check_booking_status',
            'order_info',
            'cancel_order'
          ],
          description: 'The identifier of the ETG endpoint to retrieve'
        }
      },
      required: ['endpoint_id']
    }
  },
  {
    name: 'etg_get_mock_payload',
    description: 'Returns realistic mock request and response JSON payloads for an endpoint. Enables building and unit-testing your integration without needing test credentials.',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint_id: {
          type: 'string',
          description: 'Endpoint ID (e.g., search_by_region, prebook_rate, start_booking_finish)'
        }
      },
      required: ['endpoint_id']
    }
  },
  {
    name: 'etg_get_integration_workflow',
    description: 'Returns the step-by-step required architecture workflow (e.g. full booking cycle, cancellation cycle, state machine rules, error handling).',
    inputSchema: {
      type: 'object',
      properties: {
        workflow_id: {
          type: 'string',
          enum: ['full_booking_lifecycle', 'cancellation_lifecycle'],
          description: 'The workflow process to inspect'
        }
      },
      required: ['workflow_id']
    }
  },
  {
    name: 'etg_search_docs',
    description: 'Search documentation topics, error handling guides, residency requirements, and business rules across ETG API v3.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keyword or question (e.g., "idempotency", "residency", "error codes", "webhook")'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'etg_generate_service_template',
    description: 'Returns a complete production-grade TypeScript DTO and Service interface template for your project matching ETG API requirements.',
    inputSchema: {
      type: 'object',
      properties: {
        module_type: {
          type: 'string',
          enum: ['search', 'booking', 'full'],
          description: 'The module you want code scaffolding for'
        }
      },
      required: ['module_type']
    }
  }
];
