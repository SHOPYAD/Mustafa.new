# Flight Booking Engine: Technical Integration & UI/UX Architecture Specification

**Target API Provider:** [Sky Scrapper API by apiheya (RapidAPI)](https://rapidapi.com/apiheya/api/sky-scrapper)  
**Document Scope:** Full-Stack Integration Architecture, API Contracts, Component Design, State Management, and Multi-Step Booking Funnel.

---

## 1\. System Architecture & Base API Configuration

### 1.1 API Client Setup

* **Base URL:** `https://sky-scrapper.p.rapidapi.com`  
* **Default Headers:**  
    
  x-rapidapi-host: sky-scrapper.p.rapidapi.com  
    
  x-rapidapi-key: \<RAPIDAPI\_KEY\>  
    
  Content-Type: application/json  
    
* **Performance & Caching Strategy:**  
  * **Static Configurations (`getConfig`, `getLocale`):** Cache in Redis / Local Storage for 24 hours.  
  * **Airport Search Autocomplete (`searchAirport`):** Cache results by search query for 7 days.  
  * **Price Calendar (`getPriceCalendar`):** Cache by route and month for 6 hours.  
  * **Live Search (`searchFlights`):** Do NOT cache live quotes; cache raw responses by `sessionId` during active session only (TTL: 15 minutes).

---

## 2\. Global API Endpoints Reference

| Endpoint | Method | Path | Purpose |
| :---- | :---- | :---- | :---- |
| **Server Health** | `GET` | `/api/v1/checkServer` | Verify service availability. |
| **Configuration** | `GET` | `/api/v1/getConfig` | Fetch system markets, currencies, and country codes. |
| **Locale** | `GET` | `/api/v1/getLocale` | Retrieve localization and language sets. |
| **Nearby Airports** | `GET` | `/api/v1/flights/getNearbyAirports` | Detect nearest airports via user coordinates (`lat`, `lng`). |
| **Airport Autocomplete** | `GET` | `/api/v1/flights/searchAirport` | Query airports/cities to obtain `skyId` and `entityId`. |
| **Price Calendar** | `GET` | `/api/v1/flights/getPriceCalendar` | Retrieve daily lowest price matrix across a full month. |
| **Live Flight Search (v2)** | `GET` | `/api/v2/flights/searchFlights` | Primary search for One-Way and Round-Trip flights. |
| **Search Incomplete** | `GET` | `/api/v1/flights/searchIncomplete` | Progressive polling for pending quotes via `sessionId`. |
| **Multi-Stops Search** | `GET` | `/api/v1/flights/searchFlightsMultiStops` | Search complex multi-city itineraries. |
| **Explore Everywhere** | `GET` | `/api/v1/flights/searchFlightEverywhere` | Global budget discovery for flexible destinations. |
| **Flight Details** | `GET` | `/api/v1/flights/getFlightDetails` | Retrieve detailed segment breakdown, baggage, and fare rules. |

---

## 3\. Frontend Architecture & Page Specifications

├── Homepage (/)

│   ├── Geolocation Auto-Detector

│   ├── Main Flight Search Bar (One-Way / Round-Trip / Multi-City)

│   │   ├── Airport Autocomplete Dropdowns

│   │   └── Date Picker with Live Price Matrix Overlay

│   └── "Explore Everywhere" Curated Deals Grid

├── Flight Search Results (/flights/search)

│   ├── Sticky Search Modifier Bar

│   ├── Filter & Sorting Sidebar

│   ├── Progressive Loading Engine (Polling)

│   └── Flight Result Card with Fare Family Selection

├── Flight Details Drawer / Modal

│   ├── Segment & Layover Timeline

│   ├── Baggage & Fare Rules Breakdown

│   └── Cancellation & Refund Policies

└── Booking & Checkout Flow (/flights/booking)

    ├── Step 1: Itinerary Confirmation & Fare Rules

    ├── Step 2: Passenger Details & Travel Documents

    ├── Step 3: Baggage & Extra Ancillaries

    ├── Step 4: Secure Payment Gateway

    └── Step 5: E-Ticket Confirmation & PDF Voucher

---

## 4\. Feature Implementation & UI Component Guidelines

### 4.1 Homepage: Zero-Click Departure & Smart Search Bar

1. **Geolocation Auto-Detection (`/api/v1/flights/getNearbyAirports`):**  
   * On initial page mount, prompt browser `navigator.geolocation.getCurrentPosition()`.  
   * Pass `lat` and `lng` to `getNearbyAirports`.  
   * Pre-populate the `Origin` input with the nearest primary international airport (e.g., `IST - Istanbul Airport`).  
2. **Airport Autocomplete Component (`/api/v1/flights/searchAirport`):**  
   * Implement debounced input (300ms delay).  
   * Render airport name, city, country, and IATA badge.  
   * Store both `skyId` (e.g., `LOND`) and `entityId` (e.g., `27544008`) in the state machine upon selection.  
3. **Interactive Price Calendar Date Picker (`/api/v1/flights/getPriceCalendar`):**  
   * When the departure date input opens, trigger `getPriceCalendar` for the selected month.  
   * Render each calendar day tile with:  
     * Date number.  
     * Lowest price tag (e.g., `$89`).  
     * Green highlight badge for the cheapest day of the month.

---

### 4.2 Homepage: "Explore Everywhere" Live Deals Showcase

* **Endpoint:** `/api/v1/flights/searchFlightEverywhere`  
* **Trigger:** Fetched on homepage load using the detected/selected origin airport.  
* **UI Layout:**  
  * Clean grid displaying cards categorized by popular countries or continents.  
  * **Card Elements:**  
    * High-resolution destination city/country image.  
    * Destination name and IATA code.  
    * "Direct flights from" / "Starting from" live price banner.  
    * Flexible travel window (e.g., "Anytime in October").  
    * **Action Button:** "View Flights" which deep-links to `/flights/search` with pre-filled query parameters (`originSkyId`, `destinationSkyId`, `originEntityId`, `destinationEntityId`, `date`, `currency`).

---

### 4.3 Search Results Page (SERP) & Progressive Loading

#### Progressive Loading Lifecycle

1. User submits search $\\rightarrow$ Trigger `/api/v2/flights/searchFlights`.  
2. Display Skeleton loading cards with shimmer animation.  
3. Render the initial batch of flight quotes immediately.  
4. Extract `sessionId` and `status` from the response.  
5. If `status !== "complete"`, poll `/api/v1/flights/searchIncomplete?sessionId=<ID>` every 1.5 seconds (up to 4 attempts) and merge incoming itineraries seamlessly into the list.

#### Filters Sidebar

* **Stops:** Non-stop, 1 Stop, 2+ Stops.  
* **Airlines:** Multi-select checklist with airline logos and minimum price per airline.  
* **Flight Times:** Double-ended range slider for Departure and Arrival windows.  
* **Duration:** Max total flight time slider.  
* **Cabin Class:** Economy, Premium Economy, Business, First.

#### Flight Result Card Architecture

* **Header Section:** Operating airline logo, flight number, aircraft model.  
* **Journey Section:** Departure time $\\rightarrow$ Duration & Layover Badges (e.g., "1h 45m Layover in DXB") $\\rightarrow$ Arrival time (+1 day indicator if overnight).  
* **Badges:** `Cheapest`, `Fastest`, `Best Value` (AI-ranked based on price vs duration).  
* **Pricing & CTA:**  
  * Total price with breakdown (Base fare \+ Taxes & Fees).  
  * "Select Flight" expandable button displaying Fare Tiers (e.g., Basic Light, Standard with 20kg Bag, Flexible with Free Cancellation).

---

### 4.4 Flight Details, Baggage & Policies Modal

* **Endpoint:** `/api/v1/flights/getFlightDetails`  
* **Modal Sections:**  
  1. **Detailed Flight Timeline:**  
     * Departure airport, terminal, gate, and local time.  
     * Flight leg details, operating carrier, aircraft type.  
     * Layover alert box with self-transfer warnings if applicable.  
  2. **Baggage Allowance Policy:**  
     * Cabin baggage allowance (e.g., 1 personal item \+ 1 carry-on up to 8kg).  
     * Checked baggage allowance (e.g., 1 piece up to 23kg included or optional add-on).  
  3. **Cancellation & Refund Rules:**  
     * Clear status indicators: `Refundable with fee`, `Non-refundable`, `Free date change up to 24h prior`.  
     * Detailed penalty schedule.

---

## 5\. Multi-Step Checkout & Booking Funnel

### Step 1: Fare Review & Add-ons

* Display selected flight summary.  
* Upsell baggage tiers and flexible ticket insurance.

### Step 2: Passenger Information Form

* Validation for all fields per passenger (Adults, Children, Infants):  
  * Title, First Name, Last Name (must match Passport verbatim).  
  * Date of Birth, Gender, Nationality.  
  * Passport Number, Issuing Country, Expiry Date.  
  * Frequent Flyer Program & Special Meal Requests.

### Step 3: Ancillaries & Seat Selection

* Interactive visual seat layout map (Window / Aisle / Extra Legroom).  
* Priority boarding and travel medical insurance add-ons.

### Step 4: Secure Payment Gateway

* Supported Payment Gateways: Stripe / Checkout.com / Local Gateways.  
* Payment Methods: Credit/Debit Cards, Apple Pay, Google Pay.  
* 3D-Secure 2.0 authentication integration.  
* Transparent price summary showing itemized taxes, fees, and currency conversion.

### Step 5: Booking Confirmation & Voucher Generation

* Display PNR / Booking Reference Code.  
* Automatic email dispatch with attached PDF e-Ticket voucher.  
* "Add to Google Calendar / Apple Wallet" buttons.

---

## 6\. Error Handling & Edge Cases

* **Zero Results:** Display friendly fallback suggestions (e.g., "Try nearby airports" or "Explore flexible dates").  
* **Fare Change Detection:** If the price changes between search and detail fetch, prompt the user with a modal explaining the price adjustment before proceeding to payment.  
* **Rate Limiting (429 Too Many Requests):** Implement exponential backoff with retry headers.

