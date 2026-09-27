import type { DomainId } from "./catalog";
import type { GraphPosition } from "./workspace";
/** Art-directed coordinates measured from reference 01 at 1672 × 941.
 * These are navigation/containment relationships, NOT runtime dependencies.
 * The 11 visual families contain all 15 source-derived business domains.
 * Keeping composition separate from the source catalog avoids inventing endpoints.
 */
export interface AtlasCluster {
 id: string; label: string; domains: DomainId[]; hub: GraphPosition;
 leaf: GraphPosition; side: number; tone: string; pages: string[];
}
export const ATLAS_CORE = { x: 745, y: 455 };
export const ATLAS_CLUSTERS: AtlasCluster[] = [
  {
    "id": "overview",
    "label": "نظرة عامة",
    "domains": [
      "overview"
    ],
    "hub": {
      "x": 695,
      "y": 227
    },
    "leaf": {
      "x": 690,
      "y": 120
    },
    "side": 1,
    "tone": "ion",
    "pages": [
      "/admin/dashboard"
    ]
  },
  {
    "id": "bookings",
    "label": "الحجوزات",
    "domains": [
      "bookings"
    ],
    "hub": {
      "x": 863,
      "y": 246
    },
    "leaf": {
      "x": 909,
      "y": 155
    },
    "side": 1,
    "tone": "ion",
    "pages": [
      "/admin/bookings",
      "/admin/cancellations",
      "/admin/reviews"
    ]
  },
  {
    "id": "services",
    "label": "الخدمات",
    "domains": [
      "flights",
      "hotels",
      "mobility"
    ],
    "hub": {
      "x": 989,
      "y": 354
    },
    "leaf": {
      "x": 1056,
      "y": 278
    },
    "side": 1,
    "tone": "amber",
    "pages": [
      "/admin/hotels",
      "/admin/flights",
      "/admin/packages",
      "/admin/transfers",
      "/admin/cars",
      "/admin/tours",
      "/admin/visa"
    ]
  },
  {
    "id": "cms",
    "label": "محتوى الموقع",
    "domains": [
      "cms"
    ],
    "hub": {
      "x": 978,
      "y": 508
    },
    "leaf": {
      "x": 1063,
      "y": 478
    },
    "side": 1,
    "tone": "mint",
    "pages": [
      "/admin/visual-editor",
      "/admin/pages",
      "/admin/blog",
      "/admin/search-tabs",
      "/admin/pwa",
      "/admin/mobile-app"
    ]
  },
  {
    "id": "customers",
    "label": "العملاء",
    "domains": [
      "customers"
    ],
    "hub": {
      "x": 894,
      "y": 656
    },
    "leaf": {
      "x": 980,
      "y": 687
    },
    "side": 1,
    "tone": "violet",
    "pages": [
      "/admin/customers",
      "/admin/email",
      "/admin/social-community"
    ]
  },
  {
    "id": "marketing",
    "label": "التسويق والنشر",
    "domains": [
      "publishing",
      "growth"
    ],
    "hub": {
      "x": 760,
      "y": 670
    },
    "leaf": {
      "x": 710,
      "y": 746
    },
    "side": 1,
    "tone": "ion",
    "pages": [
      "/admin/social-accounts",
      "/admin/publish",
      "/admin/publish/compose",
      "/admin/media",
      "/admin/ads",
      "/admin/affiliate"
    ]
  },
  {
    "id": "agents",
    "label": "الذكاء الاصطناعي",
    "domains": [
      "agents",
      "automation"
    ],
    "hub": {
      "x": 622,
      "y": 649
    },
    "leaf": {
      "x": 568,
      "y": 724
    },
    "side": -1,
    "tone": "amber",
    "pages": [
      "/admin/agent-war-room",
      "/admin/agent-studio",
      "/admin/b2b-landing-agent",
      "/admin/ai-settings",
      "/admin/automation"
    ]
  },
  {
    "id": "finance",
    "label": "المالية",
    "domains": [
      "finance"
    ],
    "hub": {
      "x": 528,
      "y": 572
    },
    "leaf": {
      "x": 444,
      "y": 578
    },
    "side": -1,
    "tone": "ion",
    "pages": [
      "/admin/payments",
      "/admin/currencies",
      "/admin/invoices",
      "/admin/b2b-wallet",
      "/admin/gift-cards"
    ]
  },
  {
    "id": "security",
    "label": "الامتثال القانوني",
    "domains": [
      "security"
    ],
    "hub": {
      "x": 500,
      "y": 457
    },
    "leaf": {
      "x": 411,
      "y": 447
    },
    "side": -1,
    "tone": "violet",
    "pages": [
      "/admin/legal",
      "/admin/license"
    ]
  },
  {
    "id": "settings",
    "label": "الإعدادات",
    "domains": [
      "settings"
    ],
    "hub": {
      "x": 529,
      "y": 352
    },
    "leaf": {
      "x": 453,
      "y": 289
    },
    "side": -1,
    "tone": "ion",
    "pages": [
      "/admin/contact-settings",
      "/admin/integrations",
      "/admin/pocketbase",
      "/admin/translations",
      "/admin/settings"
    ]
  },
  {
    "id": "b2b",
    "label": "إعادة البيع",
    "domains": [
      "b2b"
    ],
    "hub": {
      "x": 623,
      "y": 259
    },
    "leaf": {
      "x": 576,
      "y": 147
    },
    "side": -1,
    "tone": "amber",
    "pages": [
      "/admin/resale/companies",
      "/admin/resale/whitelabel",
      "/admin/resale/subscriptions",
      "/admin/resale/wallets",
      "/admin/resale/domains",
      "/admin/resale/licenses",
      "/admin/resale/updates"
    ]
  }
];
