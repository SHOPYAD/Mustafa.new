# Sky Scrapper API (apiheya) \- Flight Endpoints Documentation

## Overview

- **API Provider:** apiheya (RapidAPI)  
- **Base URL:** `https://sky-scrapper.p.rapidapi.com`  
- **Host Header:** `sky-scrapper.p.rapidapi.com`  
- **Authentication Header:** `x-rapidapi-key: YOUR_RAPIDAPI_KEY`

---

## Required Request Headers

x-rapidapi-host: sky-scrapper.p.rapidapi.com

x-rapidapi-key: \<YOUR\_RAPIDAPI\_KEY\>

---

## 1\. System & Configuration Endpoints

### 1.1 Check Server Status

Checks the operational health and availability of the API server.

- **Method:** `GET`  
- **Endpoint:** `/api/v1/checkServer`  
- **Parameters:** None

### 1.2 Get Configuration

Retrieves standard default configuration values, supported markets, currencies, and country codes.

- **Method:** `GET`  
- **Endpoint:** `/api/v1/getConfig`  
- **Parameters:** None

### 1.3 Get Locale

Retrieves supported languages, locales, and regional localization settings.

- **Method:** `GET`  
- **Endpoint:** `/api/v1/getLocale`  
- **Parameters:** None

---

## 2\. Flight Discovery & Airport Search Endpoints

### 2.1 Get Nearby Airports

Finds commercial airports closest to a given geographical coordinate (latitude and longitude).

- **Method:** `GET`  
- **Endpoint:** `/api/v1/flights/getNearbyAirports`  
- **Query Parameters:**  
  - `lat` (*required*, number): Latitude of user location (e.g., `41.0082`).  
  - `lng` (*required*, number): Longitude of user location (e.g., `28.9784`).  
  - `locale` (*optional*, string): Locale code (e.g., `en-US`).

### 2.2 Search Airport

Auto-complete search for airports, cities, and metropolitan areas to retrieve their unique identifiers (`skyId` and `entityId`).

- **Method:** `GET`  
- **Endpoint:** `/api/v1/flights/searchAirport`  
- **Query Parameters:**  
  - `query` (*required*, string): Search keyword (e.g., `London`, `Istanbul`, `JFK`, `DXB`).  
  - `locale` (*optional*, string): Response localization (Default: `en-US`).

---

## 3\. Flight Search & Price Comparison Endpoints

### 3.1 Get Price Calendar

Fetches a day-by-day lowest price matrix across an entire month or timeframe between two locations.

- **Method:** `GET`  
- **Endpoint:** `/api/v1/flights/getPriceCalendar`  
- **Query Parameters:**  
  - `originSkyId` (*required*, string): Origin Sky ID (e.g., `LOND`).  
  - `destinationSkyId` (*required*, string): Destination Sky ID (e.g., `IST`).  
  - `originEntityId` (*required*, string): Origin entity ID.  
  - `destinationEntityId` (*required*, string): Destination entity ID.  
  - `fromDate` (*required*, string): Start date (`YYYY-MM-DD`).  
  - `toDate` (*optional*, string): End date (`YYYY-MM-DD`).  
  - `currency` (*optional*, string): Currency code (e.g., `USD`, `EUR`).

### 3.2 Search Flights (v2 \- Latest)

The primary real-time flight search engine for one-way and round-trip itineraries.

- **Method:** `GET`  
- **Endpoint:** `/api/v2/flights/searchFlights`  
- **Query Parameters:**  
  - `originSkyId` (*required*, string): Origin Sky ID (e.g., `IST`).  
  - `destinationSkyId` (*required*, string): Destination Sky ID (e.g., `LHR`).  
  - `originEntityId` (*required*, string): Origin Entity ID.  
  - `destinationEntityId` (*required*, string): Destination Entity ID.  
  - `date` (*required*, string): Departure date in `YYYY-MM-DD` format.  
  - `returnDate` (*optional*, string): Return date in `YYYY-MM-DD` format (for round trips).  
  - `adults` (*optional*, integer): Number of adult passengers (Default: `1`).  
  - `childrens` (*optional*, integer): Number of child passengers.  
  - `infants` (*optional*, integer): Number of infant passengers.  
  - `cabinClass` (*optional*, string): Cabin class (`economy`, `premium_economy`, `business`, `first`).  
  - `sortBy` (*optional*, string): Sort criterion (`best`, `price_high`, `fastest`, `outbound_departure_time`).  
  - `currency` (*optional*, string): Currency code (Default: `USD`).  
  - `market` (*optional*, string): Market code (e.g., `en-US`).  
  - `countryCode` (*optional*, string): Country code (e.g., `US`, `TR`, `GB`).

### 3.3 Search Incomplete

Polls and retrieves remaining live quotes when a flight search request has partial results streaming in.

- **Method:** `GET`  
- **Endpoint:** `/api/v1/flights/searchIncomplete`  
- **Query Parameters:**  
  - `sessionId` (*required*, string): Search session ID returned from `searchFlights`.

### 3.4 Search Flights Multi Stops

Searches complex itineraries consisting of multiple routes and layovers across different dates.

- **Method:** `GET`  
- **Endpoint:** `/api/v1/flights/searchFlightsMultiStops`  
- **Query Parameters:**  
  - `legs` (*required*, string): URL-encoded JSON structure of flight legs containing `originSkyId`, `destinationSkyId`, `originEntityId`, `destinationEntityId`, and `date`.  
  - `adults` (*optional*, integer): Number of adults.  
  - `cabinClass` (*optional*, string): Cabin class.  
  - `currency` (*optional*, string): Currency code.

### 3.5 Search Flight Everywhere (Explore Everywhere)

Allows exploratory flight searches without specifying a fixed destination, returning the cheapest countries and cities available globally.

- **Method:** `GET`  
- **Endpoint:** `/api/v1/flights/searchFlightEverywhere`  
- **Query Parameters:**  
  - `originSkyId` (*required*, string): Departure Sky ID (e.g., `IST`).  
  - `originEntityId` (*required*, string): Departure Entity ID.  
  - `travelDate` (*optional*, string): Specific travel date or flexible month.  
  - `currency` (*optional*, string): Currency code.  
  - `market` (*optional*, string): Market code.  
  - `countryCode` (*optional*, string): Country code.

---

## 4\. Itinerary & Booking Details Endpoints

### 4.1 Get Flight Details

Retrieves exhaustive leg details, aircraft types, baggage policies, layover intervals, and deep booking redirect links.

- **Method:** `GET`  
- **Endpoint:** `/api/v1/flights/getFlightDetails`  
- **Query Parameters:**  
  - `itineraryId` (*required*, string): Unique itinerary token from the search response.  
  - `legs` (*required*, string): Leg identification payload.  
  - `currency` (*optional*, string): Target currency code.  
  - `market` (*optional*, string): Target market code.  
  - `countryCode` (*optional*, string): Country code.

