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

export const WORKFLOWS: Record<string, IntegrationWorkflow> = {
  full_booking_lifecycle: {
    id: 'full_booking_lifecycle',
    title: 'Complete Hotel Booking Lifecycle (End-to-End)',
    description: 'The mandatory sequence of 5 steps that every integration must implement to search, lock, and book hotel rooms with RateHawk / ETG API v3.',
    steps: [
      {
        stepNumber: 1,
        action: 'Search Availability (SERP)',
        endpoint: '/api/b2b/v3/search/serp/region/ or /search/serp/hotels/',
        description: 'Query availability for a city/region or hotel IDs with checkin/checkout dates, room occupants, and residency.',
        criticalNotes: [
          'Filter out non-relevant results early.',
          'Extract the hotel ID and the starting rate book_hash.'
        ]
      },
      {
        stepNumber: 2,
        action: 'Retrieve Hotel Details & Room Inventory (Hotelpage)',
        endpoint: '/api/b2b/v3/search/hp/',
        description: 'Fetch all available room categories, meal plans, cancellation policies, and live book_hashes.',
        criticalNotes: [
          'Display detailed cancellation policies and meal types to the user.',
          'Obtain the specific room book_hash.'
        ]
      },
      {
        stepNumber: 3,
        action: 'Validate Price & Lock Rate (Prebook)',
        endpoint: '/api/b2b/v3/hotel/prebook/',
        description: 'MANDATORY: Submit the book_hash to verify room is still available and price has not changed.',
        criticalNotes: [
          'Check data.price_changed flag.',
          'If price changed and exceeds tolerance, alert the customer before proceeding.',
          'Capture the finalized rate.book_hash.'
        ]
      },
      {
        stepNumber: 4,
        action: 'Initialize Booking Form & Finish Order',
        endpoint: '/api/b2b/v3/hotel/order/booking/form/ then /hotel/order/booking/finish/',
        description: 'Generate your internal partner_order_id, open the booking session, and submit passenger names.',
        criticalNotes: [
          'partner_order_id must be unique (UUIDv4 or internal sequential order ID).',
          'Guest names must be Latin letters only.',
          'This endpoint triggers asynchronous order creation.'
        ]
      },
      {
        stepNumber: 5,
        action: 'Asynchronous Status Polling & Voucher Retrieval',
        endpoint: '/api/b2b/v3/hotel/order/booking/finish/status/ then /hotel/order/info/',
        description: 'Poll status every 2-3 seconds until status is "ok" or "failed". Once confirmed, fetch voucher and confirmation code.',
        criticalNotes: [
          'Timeout after 90 seconds and notify operations if stuck.',
          'Save ETG order_id and hotel_confirmation_code in your internal database.'
        ]
      }
    ],
    codeArchitectureGuidelines: [
      'Create a dedicated EtgApiClient with Basic Auth interceptor.',
      'Create an EtgBookingService that wraps the 5 steps into a robust state machine.',
      'Use database transactions to record your internal Order status (PENDING_PREBOOK -> PENDING_FINISH -> CONFIRMED / REJECTED).',
      'Implement an idempotency layer so duplicate requests from end users do not create multiple hotel bookings.'
    ]
  },

  cancellation_lifecycle: {
    id: 'cancellation_lifecycle',
    title: 'Order Cancellation Flow',
    description: 'Protocol for calculating penalties and cancelling a confirmed order.',
    steps: [
      {
        stepNumber: 1,
        action: 'Check Order Information & Penalty',
        endpoint: '/api/b2b/v3/hotel/order/info/',
        description: 'Retrieve current order policies to see if cancellation is free or carries a penalty.',
        criticalNotes: ['Compare current timestamp with cancellation_penalties.free_cancellation_before']
      },
      {
        stepNumber: 2,
        action: 'Submit Cancellation Request',
        endpoint: '/api/b2b/v3/hotel/order/cancel/',
        description: 'Cancel the order using partner_order_id.',
        criticalNotes: ['Update local database status to CANCELLED and log penalty amounts.']
      }
    ],
    codeArchitectureGuidelines: [
      'Provide user confirmation prompt before sending cancel request if penalty > 0.',
      'Process refund logic on payment gateway after successful cancellation.'
    ]
  }
};
