import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TRAVELPORT_SPECS } from './data/travelport.js';
import { HOTELBEDS_SPECS } from './data/hotelbeds.js';
import { BILETBANK_SPECS } from './data/biletbank.js';
import { PKFARE_SPECS } from './data/pkfare.js';
import { SEERU_SPECS } from './data/seeru.js';
import { PARASUT_SPECS } from './data/parasut.js';
import { SKY_SCRAPPER_SPECS } from './data/sky_scrapper.js';

export const ALL_PROVIDERS: Record<string, any> = {
  travelport: TRAVELPORT_SPECS,
  hotelbeds: HOTELBEDS_SPECS,
  biletbank: BILETBANK_SPECS,
  pkfare: PKFARE_SPECS,
  seeru: SEERU_SPECS,
  parasut: PARASUT_SPECS,
  sky_scrapper: SKY_SCRAPPER_SPECS
};

const PROVIDER_KEYS = Object.keys(ALL_PROVIDERS);

export const TRAVEL_TOOLS: Tool[] = [
  {
    name: 'travel_list_providers',
    description: 'Lists all available travel distributors and their supported categories (Hotels, Flights, Transfers, ERP).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'travel_get_provider_spec',
    description: 'Retrieve full API specification for a distributor: authentication scheme, required headers, endpoints, request/response models.',
    inputSchema: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: PROVIDER_KEYS,
          description: 'Distributor identifier (travelport, hotelbeds, biletbank, pkfare, seeru, parasut, sky_scrapper)'
        },
        endpoint_key: {
          type: 'string',
          description: 'Specific endpoint key (e.g. air_search_complete, hotel_search_complete, shopping_v10, air_search_init, hotel_search, create_sales_invoice)'
        }
      },
      required: ['provider']
    }
  },
  {
    name: 'travel_get_mock_payload',
    description: 'Returns realistic mock request and response payloads for unit-testing integrations without requiring active provider API credentials.',
    inputSchema: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: PROVIDER_KEYS,
          description: 'Distributor identifier'
        },
        endpoint_key: {
          type: 'string',
          description: 'Endpoint key'
        }
      },
      required: ['provider', 'endpoint_key']
    }
  },
  {
    name: 'travel_search_docs',
    description: 'Search documentation, authentication formulas, error handling rules, and integration best practices across distributors.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keyword (e.g., Leonardo, X-Signature, BiletBank, Travelport, PKFARE, Seeru, Paraşüt, MD5)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'travel_generate_adapter_scaffold',
    description: 'Generates TypeScript adapter template and types tailored for integration within hotel-engine or flight engines.',
    inputSchema: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: PROVIDER_KEYS,
          description: 'Distributor identifier'
        }
      },
      required: ['provider']
    }
  }
];
