#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { TRAVEL_TOOLS, ALL_PROVIDERS } from './tools.js';

const server = new Server(
  {
    name: 'travel-multi-provider-spec-mcp',
    version: '2.0.0'
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
);

// Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'docs://travel/providers-index',
        name: 'Travel Distributors Index (Travelport, PKFARE, Seeru, Hotelbeds, Biletbank, Paraşüt, SkyScrapper)',
        mimeType: 'application/json'
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  if (uri === 'docs://travel/providers-index') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              hotelDistributors: ['Travelport Stays v11 & Universal GDS v12', 'Hotelbeds APItude', 'Seeru Hotels v1.0.0', 'RateHawk/ETG API v3'],
              flightDistributors: ['Travelport Air JSON v11', 'PKFARE Shopping v10', 'Seeru Air v1.0.0', 'BiletBank BBOST', 'SkyScrapper RapidAPI'],
              transferDistributors: ['Seeru Ride v1.0.0'],
              erpAndAccounting: ['Paraşüt API v4 (E-Fatura & E-Arşiv)']
            },
            null,
            2
          )
        }
      ]
    };
  }
  throw new Error(`Resource not found: ${uri}`);
});

// Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TRAVEL_TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const payload = args || {};

  try {
    switch (name) {
      case 'travel_list_providers': {
        const list = Object.entries(ALL_PROVIDERS).map(([key, value]) => ({
          id: key,
          provider: value.provider,
          type: value.type,
          docsUrl: value.docsUrl,
          authType: value.auth?.type || 'Custom',
          endpointsCount: Object.keys(value.endpoints || {}).length,
          endpointKeys: Object.keys(value.endpoints || {})
        }));
        return {
          content: [{ type: 'text', text: JSON.stringify(list, null, 2) }]
        };
      }

      case 'travel_get_provider_spec': {
        const prov = ALL_PROVIDERS[payload.provider as string];
        if (!prov) {
          throw new Error(`Provider '${payload.provider}' not found. Available: ${Object.keys(ALL_PROVIDERS).join(', ')}`);
        }
        if (payload.endpoint_key) {
          const ep = prov.endpoints[payload.endpoint_key as string];
          if (!ep) {
            throw new Error(`Endpoint '${payload.endpoint_key}' not found in provider '${payload.provider}'. Available endpoints: ${Object.keys(prov.endpoints).join(', ')}`);
          }
          return {
            content: [{ type: 'text', text: JSON.stringify({ provider: prov.provider, auth: prov.auth, endpoint: ep }, null, 2) }]
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(prov, null, 2) }]
        };
      }

      case 'travel_get_mock_payload': {
        const prov = ALL_PROVIDERS[payload.provider as string];
        if (!prov) throw new Error(`Provider '${payload.provider}' not found.`);
        const ep = prov.endpoints[payload.endpoint_key as string];
        if (!ep) throw new Error(`Endpoint '${payload.endpoint_key}' not found.`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  provider: prov.provider,
                  endpoint: ep.path,
                  method: ep.method,
                  mockRequest: ep.sampleRequest,
                  mockResponse: ep.sampleResponse
                },
                null,
                2
              )
            }
          ]
        };
      }

      case 'travel_search_docs': {
        const q = (payload.query as string || '').toLowerCase();
        const matches: any[] = [];
        for (const [pKey, pVal] of Object.entries(ALL_PROVIDERS)) {
          if (
            pVal.provider.toLowerCase().includes(q) ||
            pVal.type.toLowerCase().includes(q) ||
            JSON.stringify(pVal.auth).toLowerCase().includes(q)
          ) {
            matches.push({ provider: pVal.provider, matchType: 'Provider/Auth Overview', details: pVal.auth });
          }
          for (const [epKey, epVal] of Object.entries(pVal.endpoints as Record<string, any>)) {
            if (
              epKey.toLowerCase().includes(q) ||
              (epVal.description && epVal.description.toLowerCase().includes(q)) ||
              (epVal.path && epVal.path.toLowerCase().includes(q)) ||
              (epVal.category && epVal.category.toLowerCase().includes(q))
            ) {
              matches.push({
                provider: pVal.provider,
                endpoint: epKey,
                category: epVal.category,
                path: epVal.path,
                description: epVal.description
              });
            }
          }
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ query: payload.query, results: matches }, null, 2) }]
        };
      }

      case 'travel_generate_adapter_scaffold': {
        const p = payload.provider as string;
        let scaffold = '';
        if (p === 'hotelbeds') {
          scaffold = `import crypto from 'crypto';

export class HotelbedsAdapter {
  constructor(private apiKey: string, private secret: string, private baseUrl: string) {}

  generateHeaders(): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto.createHash('sha256').update(this.apiKey + this.secret + timestamp).digest('hex');
    return {
      'Api-key': this.apiKey,
      'X-Signature': signature,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async searchHotels(params: any) { /* POST /hotel-api/1.0/hotels */ }
  async checkRates(rateKey: string) { /* POST /hotel-api/1.0/checkrates */ }
  async createBooking(bookingPayload: any) { /* POST /hotel-api/1.0/bookings */ }
  async cancelBooking(bookingId: string) { /* DELETE /hotel-api/1.0/bookings/{bookingId} */ }
}`;
        } else if (p === 'travelport') {
          scaffold = `export class TravelportStaysAdapter {
  private token: string | null = null;
  constructor(private clientId: string, private clientSecret: string, private baseUrl: string) {}

  async authenticate() { /* POST /oauth/token or /oauth/v2/token */ }
  // Air v11
  async searchFlights(criteria: any) { /* POST /11/air/search/searchcomplete */ }
  async priceFlight(offerRef: any) { /* POST /11/air/price/price */ }
  async bookFlight(bookingRq: any) { /* POST /11/air/book/airreservation */ }
  async ticketFlight(locator: string) { /* POST /11/air/ticket/ticket */ }
  // Hotel v12 / Stays v11
  async searchHotels(criteria: any) { /* POST /12/hotel/search/searchcomplete or /stays/search/hotels */ }
  async getRates(hotelId: string, criteria: any) { /* POST /stays/rates */ }
  async bookStay(payload: any) { /* POST /stays/bookings */ }
  async cancelStay(bookingId: string) { /* POST /stays/bookings/{id}/cancel */ }
}`;
        } else if (p === 'biletbank') {
          scaffold = `export class BiletbankAdapter {
  constructor(private clientKey: string, private baseUrl: string) {}

  async searchFlights(params: any) { /* POST /api/flight/search */ }
  async checkPrice(priceParams: any) { /* POST /api/flight/price */ }
  async createReservation(pnrPayload: any) { /* POST /api/flight/book */ }
  async issueTicket(pnr: string) { /* POST /api/flight/ticket */ }
}`;
        } else if (p === 'pkfare') {
          scaffold = `import crypto from 'crypto';

export class PkfareAirAdapter {
  constructor(private partnerId: string, private partnerKey: string, private baseUrl: string) {}

  private getAuth() {
    const sign = crypto.createHash('md5').update(this.partnerId + this.partnerKey).digest('hex');
    return { partnerId: this.partnerId, sign };
  }

  async searchFlights(params: any) { /* POST /json/shoppingV10 */ }
  async repriceFare(pricingInput: any) { /* POST /json/precisePricing_V12 */ }
  async fetchFareRules(solutionId: string) { /* POST /json/penaltyV4 */ }
  async createBooking(bookingInput: any) { /* POST /json/preciseBooking_V8 */ }
  async issueTicket(orderNum: string, pnr: string) { /* POST /json/ticketing */ }
  async cancelOrder(orderNum: string) { /* POST /json/cancel */ }
  async quoteRefund(orderNum: string) { /* POST /json/refundPricing/generate */ }
  async commitRefund(refundId: string) { /* POST /json/refund-api/refundRequest */ }
}`;
        } else if (p === 'seeru') {
          scaffold = `export class SeeruAdapter {
  constructor(private jwtToken: string, private flightBaseUrl: string, private hotelBaseUrl: string) {}

  // Flights v1
  async searchAir(trips: string, adults: number) { /* GET /v1/flights/search/{trips}/{adults}/0/0 */ }
  async pollAirResults(searchId: string, after?: number) { /* GET /v1/flights/result/{searchId} */ }
  async checkAirFare(booking: any) { /* POST /v1/flights/booking/fare */ }
  async saveAirBooking(payload: any) { /* POST /v1/flights/booking/save */ }
  async issueAirTicket(orderId: string) { /* POST /v1/flights/order/issue */ }
  
  // Hotels v1
  async searchHotels(criteria: any) { /* POST /v1/hotels/search */ }
  async pollHotelResults(searchId: string) { /* GET /v1/hotels/result/{searchId} */ }
  async getHotelRooms(searchId: string, hotelId: string) { /* POST /v1/hotels/rooms */ }
  async checkHotelFare(searchId: string, rateId: string) { /* POST /v1/hotels/fare */ }
  async bookHotel(bookingInput: any) { /* POST /v1/hotels/booking */ }
  
  // Rides v1
  async searchRides(criteria: any) { /* POST /v1/ride/search */ }
  async bookRide(bookingPayload: any) { /* POST /v1/ride/book */ }
}`;
        } else if (p === 'parasut') {
          scaffold = `export class ParasutAdapter {
  constructor(private clientId: string, private clientSecret: string, private companyId: string) {}

  async authenticate(username: string, password: string) { /* POST /oauth/token */ }
  async findOrCreateContact(contactData: any) { /* GET/POST /v4/{companyId}/contacts */ }
  async createSalesInvoice(invoiceData: any) { /* POST /v4/{companyId}/sales_invoices */ }
  async signEArchive(invoiceId: string) { /* POST /v4/{companyId}/e_archives */ }
  async downloadInvoicePdf(eArchiveId: string) { /* GET /v4/{companyId}/e_archives/{id}/pdf */ }
}`;
        } else {
          scaffold = `export class SkyScrapperAdapter {
  constructor(private rapidApiKey: string, private baseUrl: string) {}

  async searchAirports(query: string) { /* GET /api/v1/flights/searchAirport */ }
  async searchFlights(params: any) { /* GET /api/v2/flights/searchFlights */ }
  async getPriceCalendar(params: any) { /* GET /api/v1/flights/getPriceCalendar */ }
}`;
        }
        return {
          content: [{ type: 'text', text: scaffold }]
        };
      }

      default:
        throw new Error(`Unsupported tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: error.message || 'Error executing travel tool.' }]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Travel Multi-Provider Spec MCP Server is running on stdio');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
