/**
 * Flights provider settings — re-exports config types and helpers.
 * Runtime values come from /api/flights-config (server store + env).
 */

import {
  type FlightEngineProvider,
  type FlightProvider,
  type FlightsPublicConfig,
  type FlightsRuntimeSettings,
  type TravelpayoutsPublicConfig,
  getFlightsConfigFromEnv,
  isTravelpayoutsReady,
  parseFlightProvider,
  TRAVELPAYOUTS_WEEDLE_DESTINATIONS,
} from "@/lib/flights-config";

export type {
  FlightEngineProvider,
  FlightProvider,
  FlightsPublicConfig,
  FlightsRuntimeSettings,
  TravelpayoutsPublicConfig,
};

export {
  getFlightsConfigFromEnv,
  isTravelpayoutsReady,
  parseFlightProvider,
  TRAVELPAYOUTS_WEEDLE_DESTINATIONS,
};
