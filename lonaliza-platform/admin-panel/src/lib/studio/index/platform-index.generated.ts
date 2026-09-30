/** AUTO-GENERATED — node scripts/gen-platform-index.cjs */
import type { PlatformIndexNode } from "./types";

export const PLATFORM_INDEX_NODES: PlatformIndexNode[] = [
  {
    "id": "api.ads",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/ads",
      "en": "/api/admin/ads"
    },
    "keywords": [
      "api",
      "admin",
      "ads"
    ],
    "route": "/api/admin/ads",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.ads",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/ads/route.ts"
  },
  {
    "id": "api.ads_campaigns",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/ads/campaigns",
      "en": "/api/admin/ads/campaigns"
    },
    "keywords": [
      "api",
      "admin",
      "ads",
      "campaigns"
    ],
    "route": "/api/admin/ads/campaigns",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.ads_campaigns",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/ads/campaigns/route.ts"
  },
  {
    "id": "api.ads_google_callback",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/ads/google/callback",
      "en": "/api/admin/ads/google/callback"
    },
    "keywords": [
      "api",
      "admin",
      "ads",
      "google",
      "callback"
    ],
    "route": "/api/admin/ads/google/callback",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.ads_google_callback",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/ads/google/callback/route.ts"
  },
  {
    "id": "api.ads_google_oauth",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/ads/google/oauth",
      "en": "/api/admin/ads/google/oauth"
    },
    "keywords": [
      "api",
      "admin",
      "ads",
      "google",
      "oauth"
    ],
    "route": "/api/admin/ads/google/oauth",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.ads_google_oauth",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/ads/google/oauth/route.ts"
  },
  {
    "id": "api.ads_launch",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/ads/launch",
      "en": "/api/admin/ads/launch"
    },
    "keywords": [
      "api",
      "admin",
      "ads",
      "launch"
    ],
    "route": "/api/admin/ads/launch",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/ads/launch/route.ts"
  },
  {
    "id": "api.ads_meta_callback",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/ads/meta/callback",
      "en": "/api/admin/ads/meta/callback"
    },
    "keywords": [
      "api",
      "admin",
      "ads",
      "meta",
      "callback"
    ],
    "route": "/api/admin/ads/meta/callback",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.ads_meta_callback",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/ads/meta/callback/route.ts"
  },
  {
    "id": "api.ads_meta_oauth",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/ads/meta/oauth",
      "en": "/api/admin/ads/meta/oauth"
    },
    "keywords": [
      "api",
      "admin",
      "ads",
      "meta",
      "oauth"
    ],
    "route": "/api/admin/ads/meta/oauth",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.ads_meta_oauth",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/ads/meta/oauth/route.ts"
  },
  {
    "id": "api.ads_posts",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/ads/posts",
      "en": "/api/admin/ads/posts"
    },
    "keywords": [
      "api",
      "admin",
      "ads",
      "posts"
    ],
    "route": "/api/admin/ads/posts",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.ads_posts",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/ads/posts/route.ts"
  },
  {
    "id": "api.ads_report",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/ads/report",
      "en": "/api/admin/ads/report"
    },
    "keywords": [
      "api",
      "admin",
      "ads",
      "report"
    ],
    "route": "/api/admin/ads/report",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.ads_report",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/ads/report/route.ts"
  },
  {
    "id": "api.affiliate",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/affiliate",
      "en": "/api/admin/affiliate"
    },
    "keywords": [
      "api",
      "admin",
      "affiliate"
    ],
    "route": "/api/admin/affiliate",
    "methods": [
      "GET",
      "POST",
      "PATCH"
    ],
    "capabilityRefs": [
      "probe.affiliate",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/affiliate/route.ts"
  },
  {
    "id": "api.ai-programs",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/ai-programs",
      "en": "/api/admin/ai-programs"
    },
    "keywords": [
      "api",
      "admin",
      "ai-programs"
    ],
    "route": "/api/admin/ai-programs",
    "methods": [
      "GET",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.ai_programs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/ai-programs/route.ts"
  },
  {
    "id": "api.airlines",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/airlines",
      "en": "/api/admin/airlines"
    },
    "keywords": [
      "api",
      "admin",
      "airlines"
    ],
    "route": "/api/admin/airlines",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.airlines",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/airlines/route.ts"
  },
  {
    "id": "api.airports",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/airports",
      "en": "/api/admin/airports"
    },
    "keywords": [
      "api",
      "admin",
      "airports"
    ],
    "route": "/api/admin/airports",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.airports",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/airports/route.ts"
  },
  {
    "id": "api.analytics_realtime",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/analytics/realtime",
      "en": "/api/admin/analytics/realtime"
    },
    "keywords": [
      "api",
      "admin",
      "analytics",
      "realtime"
    ],
    "route": "/api/admin/analytics/realtime",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.analytics_realtime",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/analytics/realtime/route.ts"
  },
  {
    "id": "api.automation_abandoned-recovery",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/abandoned-recovery",
      "en": "/api/admin/automation/abandoned-recovery"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "abandoned-recovery"
    ],
    "route": "/api/admin/automation/abandoned-recovery",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.automation_abandoned_recovery",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/abandoned-recovery/route.ts"
  },
  {
    "id": "api.automation_agent-stream",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/agent-stream",
      "en": "/api/admin/automation/agent-stream"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "agent-stream"
    ],
    "route": "/api/admin/automation/agent-stream",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.automation_agent_stream",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/automation/agent-stream/route.ts"
  },
  {
    "id": "api.automation_agent-training",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/agent-training",
      "en": "/api/admin/automation/agent-training"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "agent-training"
    ],
    "route": "/api/admin/automation/agent-training",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.automation_agent_training",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/agent-training/route.ts"
  },
  {
    "id": "api.automation_agent-war-room",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/agent-war-room",
      "en": "/api/admin/automation/agent-war-room"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "agent-war-room"
    ],
    "route": "/api/admin/automation/agent-war-room",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.automation_agent_war_room",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/agent-war-room/route.ts"
  },
  {
    "id": "api.automation_bookings-studio",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/bookings-studio",
      "en": "/api/admin/automation/bookings-studio"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "bookings-studio"
    ],
    "route": "/api/admin/automation/bookings-studio",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.automation_bookings_studio",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/bookings-studio/route.ts"
  },
  {
    "id": "api.automation_comms",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/comms",
      "en": "/api/admin/automation/comms"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "comms"
    ],
    "route": "/api/admin/automation/comms",
    "methods": [
      "GET",
      "POST",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.automation_comms",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/comms/route.ts"
  },
  {
    "id": "api.automation_comms_test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/comms/test",
      "en": "/api/admin/automation/comms/test"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "comms",
      "test"
    ],
    "route": "/api/admin/automation/comms/test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/comms/test/route.ts"
  },
  {
    "id": "api.automation_connections",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/connections",
      "en": "/api/admin/automation/connections"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "connections"
    ],
    "route": "/api/admin/automation/connections",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.automation_connections",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/automation/connections/route.ts"
  },
  {
    "id": "api.automation_control-panel-tools",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/control-panel-tools",
      "en": "/api/admin/automation/control-panel-tools"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "control-panel-tools"
    ],
    "route": "/api/admin/automation/control-panel-tools",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.automation_control_panel_tools",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/control-panel-tools/route.ts"
  },
  {
    "id": "api.automation_domain-studio",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/domain-studio",
      "en": "/api/admin/automation/domain-studio"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "domain-studio"
    ],
    "route": "/api/admin/automation/domain-studio",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.automation_domain_studio",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/automation/domain-studio/route.ts"
  },
  {
    "id": "api.automation_excluded-contacts",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/excluded-contacts",
      "en": "/api/admin/automation/excluded-contacts"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "excluded-contacts"
    ],
    "route": "/api/admin/automation/excluded-contacts",
    "methods": [
      "GET",
      "POST",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.automation_excluded_contacts",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/excluded-contacts/route.ts"
  },
  {
    "id": "api.automation_jobs",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/jobs",
      "en": "/api/admin/automation/jobs"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "jobs"
    ],
    "route": "/api/admin/automation/jobs",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.automation_jobs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/jobs/route.ts"
  },
  {
    "id": "api.automation_jobs__id",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/jobs/:id",
      "en": "/api/admin/automation/jobs/:id"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "jobs",
      ":id"
    ],
    "route": "/api/admin/automation/jobs/:id",
    "methods": [
      "GET",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.automation_jobs_id",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/jobs/[id]/route.ts"
  },
  {
    "id": "api.automation_jobs__id_run",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/jobs/:id/run",
      "en": "/api/admin/automation/jobs/:id/run"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "jobs",
      ":id",
      "run"
    ],
    "route": "/api/admin/automation/jobs/:id/run",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/jobs/[id]/run/route.ts"
  },
  {
    "id": "api.automation_logs",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/logs",
      "en": "/api/admin/automation/logs"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "logs"
    ],
    "route": "/api/admin/automation/logs",
    "methods": [
      "GET",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.automation_logs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/logs/route.ts"
  },
  {
    "id": "api.automation_messages",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/messages",
      "en": "/api/admin/automation/messages"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "messages"
    ],
    "route": "/api/admin/automation/messages",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.automation_messages",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/messages/route.ts"
  },
  {
    "id": "api.automation_neural-atlas",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/neural-atlas",
      "en": "/api/admin/automation/neural-atlas"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "neural-atlas"
    ],
    "route": "/api/admin/automation/neural-atlas",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.automation_neural_atlas",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/automation/neural-atlas/route.ts"
  },
  {
    "id": "api.automation_neural-expansion",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/neural-expansion",
      "en": "/api/admin/automation/neural-expansion"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "neural-expansion"
    ],
    "route": "/api/admin/automation/neural-expansion",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.automation_neural_expansion",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/automation/neural-expansion/route.ts"
  },
  {
    "id": "api.automation_second-brain-data",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/second-brain-data",
      "en": "/api/admin/automation/second-brain-data"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "second-brain-data"
    ],
    "route": "/api/admin/automation/second-brain-data",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.automation_second_brain_data",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/automation/second-brain-data/route.ts"
  },
  {
    "id": "api.automation_second-brain-directive",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/second-brain-directive",
      "en": "/api/admin/automation/second-brain-directive"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "second-brain-directive"
    ],
    "route": "/api/admin/automation/second-brain-directive",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/second-brain-directive/route.ts"
  },
  {
    "id": "api.automation_settings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/settings",
      "en": "/api/admin/automation/settings"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "settings"
    ],
    "route": "/api/admin/automation/settings",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.automation_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/settings/route.ts"
  },
  {
    "id": "api.automation_swarm-deliberate",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/swarm-deliberate",
      "en": "/api/admin/automation/swarm-deliberate"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "swarm-deliberate"
    ],
    "route": "/api/admin/automation/swarm-deliberate",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/swarm-deliberate/route.ts"
  },
  {
    "id": "api.automation_timeline-fallback",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/timeline-fallback",
      "en": "/api/admin/automation/timeline-fallback"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "timeline-fallback"
    ],
    "route": "/api/admin/automation/timeline-fallback",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/timeline-fallback/route.ts"
  },
  {
    "id": "api.automation_voice-tts",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/voice-tts",
      "en": "/api/admin/automation/voice-tts"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "voice-tts"
    ],
    "route": "/api/admin/automation/voice-tts",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/voice-tts/route.ts"
  },
  {
    "id": "api.automation_whatsapp-qr",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/automation/whatsapp-qr",
      "en": "/api/admin/automation/whatsapp-qr"
    },
    "keywords": [
      "api",
      "admin",
      "automation",
      "whatsapp-qr"
    ],
    "route": "/api/admin/automation/whatsapp-qr",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.automation_whatsapp_qr",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/automation/whatsapp-qr/route.ts"
  },
  {
    "id": "api.b2b-landing-agent",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/b2b-landing-agent",
      "en": "/api/admin/b2b-landing-agent"
    },
    "keywords": [
      "api",
      "admin",
      "b2b-landing-agent"
    ],
    "route": "/api/admin/b2b-landing-agent",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.b2b_landing_agent",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/b2b-landing-agent/route.ts"
  },
  {
    "id": "api.b2b-wallet",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/b2b-wallet",
      "en": "/api/admin/b2b-wallet"
    },
    "keywords": [
      "api",
      "admin",
      "b2b-wallet"
    ],
    "route": "/api/admin/b2b-wallet",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.b2b_wallet",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/b2b-wallet/route.ts"
  },
  {
    "id": "api.blog",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/blog",
      "en": "/api/admin/blog"
    },
    "keywords": [
      "api",
      "admin",
      "blog"
    ],
    "route": "/api/admin/blog",
    "methods": [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.blog",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/blog/route.ts"
  },
  {
    "id": "api.blog__id",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/blog/:id",
      "en": "/api/admin/blog/:id"
    },
    "keywords": [
      "api",
      "admin",
      "blog",
      ":id"
    ],
    "route": "/api/admin/blog/:id",
    "methods": [
      "GET",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.blog_id",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/blog/[id]/route.ts"
  },
  {
    "id": "api.booking-connect-test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/booking-connect-test",
      "en": "/api/admin/booking-connect-test"
    },
    "keywords": [
      "api",
      "admin",
      "booking-connect-test"
    ],
    "route": "/api/admin/booking-connect-test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/booking-connect-test/route.ts"
  },
  {
    "id": "api.branding",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/branding",
      "en": "/api/admin/branding"
    },
    "keywords": [
      "api",
      "admin",
      "branding"
    ],
    "route": "/api/admin/branding",
    "methods": [
      "GET",
      "POST",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.branding",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/branding/route.ts"
  },
  {
    "id": "api.branding_upload",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/branding/upload",
      "en": "/api/admin/branding/upload"
    },
    "keywords": [
      "api",
      "admin",
      "branding",
      "upload"
    ],
    "route": "/api/admin/branding/upload",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/branding/upload/route.ts"
  },
  {
    "id": "api.builder-agent",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/builder-agent",
      "en": "/api/admin/builder-agent"
    },
    "keywords": [
      "api",
      "admin",
      "builder-agent"
    ],
    "route": "/api/admin/builder-agent",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.builder_agent",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/builder-agent/route.ts"
  },
  {
    "id": "api.builder-pages",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/builder-pages",
      "en": "/api/admin/builder-pages"
    },
    "keywords": [
      "api",
      "admin",
      "builder-pages"
    ],
    "route": "/api/admin/builder-pages",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.builder_pages",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/builder-pages/route.ts"
  },
  {
    "id": "api.cancellations",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/cancellations",
      "en": "/api/admin/cancellations"
    },
    "keywords": [
      "api",
      "admin",
      "cancellations"
    ],
    "route": "/api/admin/cancellations",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.cancellations",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/cancellations/route.ts"
  },
  {
    "id": "api.cars",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/cars",
      "en": "/api/admin/cars"
    },
    "keywords": [
      "api",
      "admin",
      "cars"
    ],
    "route": "/api/admin/cars",
    "methods": [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.cars",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/cars/route.ts"
  },
  {
    "id": "api.cars-settings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/cars-settings",
      "en": "/api/admin/cars-settings"
    },
    "keywords": [
      "api",
      "admin",
      "cars-settings"
    ],
    "route": "/api/admin/cars-settings",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.cars_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/cars-settings/route.ts"
  },
  {
    "id": "api.copilot-fs",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/copilot-fs",
      "en": "/api/admin/copilot-fs"
    },
    "keywords": [
      "api",
      "admin",
      "copilot-fs"
    ],
    "route": "/api/admin/copilot-fs",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.copilot_fs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/copilot-fs/route.ts"
  },
  {
    "id": "api.crm_leads",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/crm/leads",
      "en": "/api/admin/crm/leads"
    },
    "keywords": [
      "api",
      "admin",
      "crm",
      "leads"
    ],
    "route": "/api/admin/crm/leads",
    "methods": [
      "GET",
      "PATCH"
    ],
    "capabilityRefs": [
      "probe.crm_leads",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/crm/leads/route.ts"
  },
  {
    "id": "api.currencies",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/currencies",
      "en": "/api/admin/currencies"
    },
    "keywords": [
      "api",
      "admin",
      "currencies"
    ],
    "route": "/api/admin/currencies",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.currencies",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/currencies/route.ts"
  },
  {
    "id": "api.dashboard-stats",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/dashboard-stats",
      "en": "/api/admin/dashboard-stats"
    },
    "keywords": [
      "api",
      "admin",
      "dashboard-stats"
    ],
    "route": "/api/admin/dashboard-stats",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.dashboard_stats",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/dashboard-stats/route.ts"
  },
  {
    "id": "api.demo-seed",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/demo-seed",
      "en": "/api/admin/demo-seed"
    },
    "keywords": [
      "api",
      "admin",
      "demo-seed"
    ],
    "route": "/api/admin/demo-seed",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.demo_seed",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/demo-seed/route.ts"
  },
  {
    "id": "api.email-campaigns",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-campaigns",
      "en": "/api/admin/email-campaigns"
    },
    "keywords": [
      "api",
      "admin",
      "email-campaigns"
    ],
    "route": "/api/admin/email-campaigns",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.email_campaigns",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-campaigns/route.ts"
  },
  {
    "id": "api.email-campaigns__id",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-campaigns/:id",
      "en": "/api/admin/email-campaigns/:id"
    },
    "keywords": [
      "api",
      "admin",
      "email-campaigns",
      ":id"
    ],
    "route": "/api/admin/email-campaigns/:id",
    "methods": [
      "GET",
      "PATCH"
    ],
    "capabilityRefs": [
      "probe.email_campaigns_id",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-campaigns/[id]/route.ts"
  },
  {
    "id": "api.email-campaigns__id_send",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-campaigns/:id/send",
      "en": "/api/admin/email-campaigns/:id/send"
    },
    "keywords": [
      "api",
      "admin",
      "email-campaigns",
      ":id",
      "send"
    ],
    "route": "/api/admin/email-campaigns/:id/send",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-campaigns/[id]/send/route.ts"
  },
  {
    "id": "api.email-campaigns__id_test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-campaigns/:id/test",
      "en": "/api/admin/email-campaigns/:id/test"
    },
    "keywords": [
      "api",
      "admin",
      "email-campaigns",
      ":id",
      "test"
    ],
    "route": "/api/admin/email-campaigns/:id/test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-campaigns/[id]/test/route.ts"
  },
  {
    "id": "api.email-campaigns_parse-file",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-campaigns/parse-file",
      "en": "/api/admin/email-campaigns/parse-file"
    },
    "keywords": [
      "api",
      "admin",
      "email-campaigns",
      "parse-file"
    ],
    "route": "/api/admin/email-campaigns/parse-file",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-campaigns/parse-file/route.ts"
  },
  {
    "id": "api.email-settings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-settings",
      "en": "/api/admin/email-settings"
    },
    "keywords": [
      "api",
      "admin",
      "email-settings"
    ],
    "route": "/api/admin/email-settings",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.email_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-settings/route.ts"
  },
  {
    "id": "api.email-settings_dns",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-settings/dns",
      "en": "/api/admin/email-settings/dns"
    },
    "keywords": [
      "api",
      "admin",
      "email-settings",
      "dns"
    ],
    "route": "/api/admin/email-settings/dns",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.email_settings_dns",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-settings/dns/route.ts"
  },
  {
    "id": "api.email-settings_test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-settings/test",
      "en": "/api/admin/email-settings/test"
    },
    "keywords": [
      "api",
      "admin",
      "email-settings",
      "test"
    ],
    "route": "/api/admin/email-settings/test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-settings/test/route.ts"
  },
  {
    "id": "api.email-templates",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-templates",
      "en": "/api/admin/email-templates"
    },
    "keywords": [
      "api",
      "admin",
      "email-templates"
    ],
    "route": "/api/admin/email-templates",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.email_templates",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-templates/route.ts"
  },
  {
    "id": "api.email-templates__id",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-templates/:id",
      "en": "/api/admin/email-templates/:id"
    },
    "keywords": [
      "api",
      "admin",
      "email-templates",
      ":id"
    ],
    "route": "/api/admin/email-templates/:id",
    "methods": [
      "GET",
      "PUT",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.email_templates_id",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-templates/[id]/route.ts"
  },
  {
    "id": "api.email-templates_generate",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-templates/generate",
      "en": "/api/admin/email-templates/generate"
    },
    "keywords": [
      "api",
      "admin",
      "email-templates",
      "generate"
    ],
    "route": "/api/admin/email-templates/generate",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-templates/generate/route.ts"
  },
  {
    "id": "api.email-templates_preview",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-templates/preview",
      "en": "/api/admin/email-templates/preview"
    },
    "keywords": [
      "api",
      "admin",
      "email-templates",
      "preview"
    ],
    "route": "/api/admin/email-templates/preview",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-templates/preview/route.ts"
  },
  {
    "id": "api.email-templates_test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-templates/test",
      "en": "/api/admin/email-templates/test"
    },
    "keywords": [
      "api",
      "admin",
      "email-templates",
      "test"
    ],
    "route": "/api/admin/email-templates/test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-templates/test/route.ts"
  },
  {
    "id": "api.email-templates_upload",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/email-templates/upload",
      "en": "/api/admin/email-templates/upload"
    },
    "keywords": [
      "api",
      "admin",
      "email-templates",
      "upload"
    ],
    "route": "/api/admin/email-templates/upload",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/email-templates/upload/route.ts"
  },
  {
    "id": "api.env",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/env",
      "en": "/api/admin/env"
    },
    "keywords": [
      "api",
      "admin",
      "env"
    ],
    "route": "/api/admin/env",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/env/route.ts"
  },
  {
    "id": "api.finance_overview",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/finance/overview",
      "en": "/api/admin/finance/overview"
    },
    "keywords": [
      "api",
      "admin",
      "finance",
      "overview"
    ],
    "route": "/api/admin/finance/overview",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.finance_overview",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/finance/overview/route.ts"
  },
  {
    "id": "api.flight-extras",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/flight-extras",
      "en": "/api/admin/flight-extras"
    },
    "keywords": [
      "api",
      "admin",
      "flight-extras"
    ],
    "route": "/api/admin/flight-extras",
    "methods": [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.flight_extras",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/flight-extras/route.ts"
  },
  {
    "id": "api.flights_post-ops",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/flights/post-ops",
      "en": "/api/admin/flights/post-ops"
    },
    "keywords": [
      "api",
      "admin",
      "flights",
      "post-ops"
    ],
    "route": "/api/admin/flights/post-ops",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.flights_post_ops",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/flights/post-ops/route.ts"
  },
  {
    "id": "api.flights-connect-test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/flights-connect-test",
      "en": "/api/admin/flights-connect-test"
    },
    "keywords": [
      "api",
      "admin",
      "flights-connect-test"
    ],
    "route": "/api/admin/flights-connect-test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/flights-connect-test/route.ts"
  },
  {
    "id": "api.flights-settings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/flights-settings",
      "en": "/api/admin/flights-settings"
    },
    "keywords": [
      "api",
      "admin",
      "flights-settings"
    ],
    "route": "/api/admin/flights-settings",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.flights_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/flights-settings/route.ts"
  },
  {
    "id": "api.gift-cards",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/gift-cards",
      "en": "/api/admin/gift-cards"
    },
    "keywords": [
      "api",
      "admin",
      "gift-cards"
    ],
    "route": "/api/admin/gift-cards",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.gift_cards",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/gift-cards/route.ts"
  },
  {
    "id": "api.homepage-template",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/homepage-template",
      "en": "/api/admin/homepage-template"
    },
    "keywords": [
      "api",
      "admin",
      "homepage-template"
    ],
    "route": "/api/admin/homepage-template",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.homepage_template",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/homepage-template/route.ts"
  },
  {
    "id": "api.hotel-supply",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/hotel-supply",
      "en": "/api/admin/hotel-supply"
    },
    "keywords": [
      "api",
      "admin",
      "hotel-supply"
    ],
    "route": "/api/admin/hotel-supply",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.hotel_supply",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/hotel-supply/route.ts"
  },
  {
    "id": "api.hotels_featured-sync",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/hotels/featured-sync",
      "en": "/api/admin/hotels/featured-sync"
    },
    "keywords": [
      "api",
      "admin",
      "hotels",
      "featured-sync"
    ],
    "route": "/api/admin/hotels/featured-sync",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.hotels_featured_sync",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/hotels/featured-sync/route.ts"
  },
  {
    "id": "api.hotels-settings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/hotels-settings",
      "en": "/api/admin/hotels-settings"
    },
    "keywords": [
      "api",
      "admin",
      "hotels-settings"
    ],
    "route": "/api/admin/hotels-settings",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.hotels_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/hotels-settings/route.ts"
  },
  {
    "id": "api.integrations",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/integrations",
      "en": "/api/admin/integrations"
    },
    "keywords": [
      "api",
      "admin",
      "integrations"
    ],
    "route": "/api/admin/integrations",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.integrations",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/integrations/route.ts"
  },
  {
    "id": "api.invoice-templates",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/invoice-templates",
      "en": "/api/admin/invoice-templates"
    },
    "keywords": [
      "api",
      "admin",
      "invoice-templates"
    ],
    "route": "/api/admin/invoice-templates",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.invoice_templates",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/invoice-templates/route.ts"
  },
  {
    "id": "api.invoice-templates_preview",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/invoice-templates/preview",
      "en": "/api/admin/invoice-templates/preview"
    },
    "keywords": [
      "api",
      "admin",
      "invoice-templates",
      "preview"
    ],
    "route": "/api/admin/invoice-templates/preview",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/invoice-templates/preview/route.ts"
  },
  {
    "id": "api.iyzico-bookings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/iyzico-bookings",
      "en": "/api/admin/iyzico-bookings"
    },
    "keywords": [
      "api",
      "admin",
      "iyzico-bookings"
    ],
    "route": "/api/admin/iyzico-bookings",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.iyzico_bookings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/iyzico-bookings/route.ts"
  },
  {
    "id": "api.iyzico-test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/iyzico-test",
      "en": "/api/admin/iyzico-test"
    },
    "keywords": [
      "api",
      "admin",
      "iyzico-test"
    ],
    "route": "/api/admin/iyzico-test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/iyzico-test/route.ts"
  },
  {
    "id": "api.legal",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/legal",
      "en": "/api/admin/legal"
    },
    "keywords": [
      "api",
      "admin",
      "legal"
    ],
    "route": "/api/admin/legal",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.legal",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/legal/route.ts"
  },
  {
    "id": "api.legal_ai-advisor",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/legal/ai-advisor",
      "en": "/api/admin/legal/ai-advisor"
    },
    "keywords": [
      "api",
      "admin",
      "legal",
      "ai-advisor"
    ],
    "route": "/api/admin/legal/ai-advisor",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/legal/ai-advisor/route.ts"
  },
  {
    "id": "api.legal_clauses",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/legal/clauses",
      "en": "/api/admin/legal/clauses"
    },
    "keywords": [
      "api",
      "admin",
      "legal",
      "clauses"
    ],
    "route": "/api/admin/legal/clauses",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/legal/clauses/route.ts"
  },
  {
    "id": "api.legal_clauses__id",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/legal/clauses/:id",
      "en": "/api/admin/legal/clauses/:id"
    },
    "keywords": [
      "api",
      "admin",
      "legal",
      "clauses",
      ":id"
    ],
    "route": "/api/admin/legal/clauses/:id",
    "methods": [
      "DELETE"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/legal/clauses/[id]/route.ts"
  },
  {
    "id": "api.legal_deletions",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/legal/deletions",
      "en": "/api/admin/legal/deletions"
    },
    "keywords": [
      "api",
      "admin",
      "legal",
      "deletions"
    ],
    "route": "/api/admin/legal/deletions",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.legal_deletions",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/legal/deletions/route.ts"
  },
  {
    "id": "api.license_activate",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/license/activate",
      "en": "/api/admin/license/activate"
    },
    "keywords": [
      "api",
      "admin",
      "license",
      "activate"
    ],
    "route": "/api/admin/license/activate",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/license/activate/route.ts"
  },
  {
    "id": "api.license_status",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/license/status",
      "en": "/api/admin/license/status"
    },
    "keywords": [
      "api",
      "admin",
      "license",
      "status"
    ],
    "route": "/api/admin/license/status",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.license_status",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/license/status/route.ts"
  },
  {
    "id": "api.loyalty",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/loyalty",
      "en": "/api/admin/loyalty"
    },
    "keywords": [
      "api",
      "admin",
      "loyalty"
    ],
    "route": "/api/admin/loyalty",
    "methods": [
      "GET",
      "POST",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.loyalty",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/loyalty/route.ts"
  },
  {
    "id": "api.mcp",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mcp",
      "en": "/api/admin/mcp"
    },
    "keywords": [
      "api",
      "admin",
      "mcp"
    ],
    "route": "/api/admin/mcp",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.mcp",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/mcp/route.ts"
  },
  {
    "id": "api.mcp__id",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mcp/:id",
      "en": "/api/admin/mcp/:id"
    },
    "keywords": [
      "api",
      "admin",
      "mcp",
      ":id"
    ],
    "route": "/api/admin/mcp/:id",
    "methods": [
      "GET",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.mcp_id",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/mcp/[id]/route.ts"
  },
  {
    "id": "api.mcp__id_test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mcp/:id/test",
      "en": "/api/admin/mcp/:id/test"
    },
    "keywords": [
      "api",
      "admin",
      "mcp",
      ":id",
      "test"
    ],
    "route": "/api/admin/mcp/:id/test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/mcp/[id]/test/route.ts"
  },
  {
    "id": "api.mcp_call",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mcp/call",
      "en": "/api/admin/mcp/call"
    },
    "keywords": [
      "api",
      "admin",
      "mcp",
      "call"
    ],
    "route": "/api/admin/mcp/call",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/mcp/call/route.ts"
  },
  {
    "id": "api.mcp_connect",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mcp/connect",
      "en": "/api/admin/mcp/connect"
    },
    "keywords": [
      "api",
      "admin",
      "mcp",
      "connect"
    ],
    "route": "/api/admin/mcp/connect",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/mcp/connect/route.ts"
  },
  {
    "id": "api.media_keys",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/media/keys",
      "en": "/api/admin/media/keys"
    },
    "keywords": [
      "api",
      "admin",
      "media",
      "keys"
    ],
    "route": "/api/admin/media/keys",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.media_keys",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/media/keys/route.ts"
  },
  {
    "id": "api.media_pexels",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/media/pexels",
      "en": "/api/admin/media/pexels"
    },
    "keywords": [
      "api",
      "admin",
      "media",
      "pexels"
    ],
    "route": "/api/admin/media/pexels",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.media_pexels",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/media/pexels/route.ts"
  },
  {
    "id": "api.media_search",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/media/search",
      "en": "/api/admin/media/search"
    },
    "keywords": [
      "api",
      "admin",
      "media",
      "search"
    ],
    "route": "/api/admin/media/search",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.media_search",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/media/search/route.ts"
  },
  {
    "id": "api.media_unsplash",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/media/unsplash",
      "en": "/api/admin/media/unsplash"
    },
    "keywords": [
      "api",
      "admin",
      "media",
      "unsplash"
    ],
    "route": "/api/admin/media/unsplash",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.media_unsplash",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/media/unsplash/route.ts"
  },
  {
    "id": "api.mobile-app",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mobile-app",
      "en": "/api/admin/mobile-app"
    },
    "keywords": [
      "api",
      "admin",
      "mobile-app"
    ],
    "route": "/api/admin/mobile-app",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.mobile_app",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/mobile-app/route.ts"
  },
  {
    "id": "api.mobile-app_agents",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mobile-app/agents",
      "en": "/api/admin/mobile-app/agents"
    },
    "keywords": [
      "api",
      "admin",
      "mobile-app",
      "agents"
    ],
    "route": "/api/admin/mobile-app/agents",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.mobile_app_agents",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/mobile-app/agents/route.ts"
  },
  {
    "id": "api.mobile-app_ai-showcase",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mobile-app/ai-showcase",
      "en": "/api/admin/mobile-app/ai-showcase"
    },
    "keywords": [
      "api",
      "admin",
      "mobile-app",
      "ai-showcase"
    ],
    "route": "/api/admin/mobile-app/ai-showcase",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/mobile-app/ai-showcase/route.ts"
  },
  {
    "id": "api.mobile-app_ai-slides",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mobile-app/ai-slides",
      "en": "/api/admin/mobile-app/ai-slides"
    },
    "keywords": [
      "api",
      "admin",
      "mobile-app",
      "ai-slides"
    ],
    "route": "/api/admin/mobile-app/ai-slides",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/mobile-app/ai-slides/route.ts"
  },
  {
    "id": "api.mobile-app_build",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mobile-app/build",
      "en": "/api/admin/mobile-app/build"
    },
    "keywords": [
      "api",
      "admin",
      "mobile-app",
      "build"
    ],
    "route": "/api/admin/mobile-app/build",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/mobile-app/build/route.ts"
  },
  {
    "id": "api.mobile-app_download",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mobile-app/download",
      "en": "/api/admin/mobile-app/download"
    },
    "keywords": [
      "api",
      "admin",
      "mobile-app",
      "download"
    ],
    "route": "/api/admin/mobile-app/download",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.mobile_app_download",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/mobile-app/download/route.ts"
  },
  {
    "id": "api.mobile-app_github-dispatch",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mobile-app/github-dispatch",
      "en": "/api/admin/mobile-app/github-dispatch"
    },
    "keywords": [
      "api",
      "admin",
      "mobile-app",
      "github-dispatch"
    ],
    "route": "/api/admin/mobile-app/github-dispatch",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/mobile-app/github-dispatch/route.ts"
  },
  {
    "id": "api.mobile-app_icon-generator",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mobile-app/icon-generator",
      "en": "/api/admin/mobile-app/icon-generator"
    },
    "keywords": [
      "api",
      "admin",
      "mobile-app",
      "icon-generator"
    ],
    "route": "/api/admin/mobile-app/icon-generator",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.mobile_app_icon_generator",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/mobile-app/icon-generator/route.ts"
  },
  {
    "id": "api.mobile-app_notifications",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/mobile-app/notifications",
      "en": "/api/admin/mobile-app/notifications"
    },
    "keywords": [
      "api",
      "admin",
      "mobile-app",
      "notifications"
    ],
    "route": "/api/admin/mobile-app/notifications",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.mobile_app_notifications",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/mobile-app/notifications/route.ts"
  },
  {
    "id": "api.new-bookings-count",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/new-bookings-count",
      "en": "/api/admin/new-bookings-count"
    },
    "keywords": [
      "api",
      "admin",
      "new-bookings-count"
    ],
    "route": "/api/admin/new-bookings-count",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.new_bookings_count",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/new-bookings-count/route.ts"
  },
  {
    "id": "api.notifications",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/notifications",
      "en": "/api/admin/notifications"
    },
    "keywords": [
      "api",
      "admin",
      "notifications"
    ],
    "route": "/api/admin/notifications",
    "methods": [
      "GET",
      "PATCH"
    ],
    "capabilityRefs": [
      "probe.notifications",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/notifications/route.ts"
  },
  {
    "id": "api.openrouter_config",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/openrouter/config",
      "en": "/api/admin/openrouter/config"
    },
    "keywords": [
      "api",
      "admin",
      "openrouter",
      "config"
    ],
    "route": "/api/admin/openrouter/config",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.openrouter_config",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/openrouter/config/route.ts"
  },
  {
    "id": "api.openrouter_sync",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/openrouter/sync",
      "en": "/api/admin/openrouter/sync"
    },
    "keywords": [
      "api",
      "admin",
      "openrouter",
      "sync"
    ],
    "route": "/api/admin/openrouter/sync",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.openrouter_sync",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/openrouter/sync/route.ts"
  },
  {
    "id": "api.owned-hotels-test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/owned-hotels-test",
      "en": "/api/admin/owned-hotels-test"
    },
    "keywords": [
      "api",
      "admin",
      "owned-hotels-test"
    ],
    "route": "/api/admin/owned-hotels-test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/owned-hotels-test/route.ts"
  },
  {
    "id": "api.packages",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/packages",
      "en": "/api/admin/packages"
    },
    "keywords": [
      "api",
      "admin",
      "packages"
    ],
    "route": "/api/admin/packages",
    "methods": [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.packages",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/packages/route.ts"
  },
  {
    "id": "api.pages",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/pages",
      "en": "/api/admin/pages"
    },
    "keywords": [
      "api",
      "admin",
      "pages"
    ],
    "route": "/api/admin/pages",
    "methods": [
      "GET",
      "POST",
      "PUT",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.pages",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/pages/route.ts"
  },
  {
    "id": "api.parasut_invoices",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/parasut/invoices",
      "en": "/api/admin/parasut/invoices"
    },
    "keywords": [
      "api",
      "admin",
      "parasut",
      "invoices"
    ],
    "route": "/api/admin/parasut/invoices",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.parasut_invoices",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/parasut/invoices/route.ts"
  },
  {
    "id": "api.parasut_issue",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/parasut/issue",
      "en": "/api/admin/parasut/issue"
    },
    "keywords": [
      "api",
      "admin",
      "parasut",
      "issue"
    ],
    "route": "/api/admin/parasut/issue",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/parasut/issue/route.ts"
  },
  {
    "id": "api.parasut_settings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/parasut/settings",
      "en": "/api/admin/parasut/settings"
    },
    "keywords": [
      "api",
      "admin",
      "parasut",
      "settings"
    ],
    "route": "/api/admin/parasut/settings",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.parasut_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/parasut/settings/route.ts"
  },
  {
    "id": "api.parasut_test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/parasut/test",
      "en": "/api/admin/parasut/test"
    },
    "keywords": [
      "api",
      "admin",
      "parasut",
      "test"
    ],
    "route": "/api/admin/parasut/test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/parasut/test/route.ts"
  },
  {
    "id": "api.payments_catalog",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/payments/catalog",
      "en": "/api/admin/payments/catalog"
    },
    "keywords": [
      "api",
      "admin",
      "payments",
      "catalog"
    ],
    "route": "/api/admin/payments/catalog",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.payments_catalog",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/payments/catalog/route.ts"
  },
  {
    "id": "api.payments_configs",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/payments/configs",
      "en": "/api/admin/payments/configs"
    },
    "keywords": [
      "api",
      "admin",
      "payments",
      "configs"
    ],
    "route": "/api/admin/payments/configs",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.payments_configs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/payments/configs/route.ts"
  },
  {
    "id": "api.payments_test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/payments/test",
      "en": "/api/admin/payments/test"
    },
    "keywords": [
      "api",
      "admin",
      "payments",
      "test"
    ],
    "route": "/api/admin/payments/test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/payments/test/route.ts"
  },
  {
    "id": "api.payments_toggle",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/payments/toggle",
      "en": "/api/admin/payments/toggle"
    },
    "keywords": [
      "api",
      "admin",
      "payments",
      "toggle"
    ],
    "route": "/api/admin/payments/toggle",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/payments/toggle/route.ts"
  },
  {
    "id": "api.payments-settings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/payments-settings",
      "en": "/api/admin/payments-settings"
    },
    "keywords": [
      "api",
      "admin",
      "payments-settings"
    ],
    "route": "/api/admin/payments-settings",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.payments_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/payments-settings/route.ts"
  },
  {
    "id": "api.platform-admin_chat",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/platform-admin/chat",
      "en": "/api/admin/platform-admin/chat"
    },
    "keywords": [
      "api",
      "admin",
      "platform-admin",
      "chat"
    ],
    "route": "/api/admin/platform-admin/chat",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/platform-admin/chat/route.ts"
  },
  {
    "id": "api.platform-readiness",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/platform-readiness",
      "en": "/api/admin/platform-readiness"
    },
    "keywords": [
      "api",
      "admin",
      "platform-readiness"
    ],
    "route": "/api/admin/platform-readiness",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.platform_readiness",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/platform-readiness/route.ts"
  },
  {
    "id": "api.pocketbase",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/pocketbase",
      "en": "/api/admin/pocketbase"
    },
    "keywords": [
      "api",
      "admin",
      "pocketbase"
    ],
    "route": "/api/admin/pocketbase",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.pocketbase",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/pocketbase/route.ts"
  },
  {
    "id": "api.pocketbase_handoff",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/pocketbase/handoff",
      "en": "/api/admin/pocketbase/handoff"
    },
    "keywords": [
      "api",
      "admin",
      "pocketbase",
      "handoff"
    ],
    "route": "/api/admin/pocketbase/handoff",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.pocketbase_handoff",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/pocketbase/handoff/route.ts"
  },
  {
    "id": "api.pocketbase_open",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/pocketbase/open",
      "en": "/api/admin/pocketbase/open"
    },
    "keywords": [
      "api",
      "admin",
      "pocketbase",
      "open"
    ],
    "route": "/api/admin/pocketbase/open",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.pocketbase_open",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/pocketbase/open/route.ts"
  },
  {
    "id": "api.pocketbase_superuser",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/pocketbase/superuser",
      "en": "/api/admin/pocketbase/superuser"
    },
    "keywords": [
      "api",
      "admin",
      "pocketbase",
      "superuser"
    ],
    "route": "/api/admin/pocketbase/superuser",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/pocketbase/superuser/route.ts"
  },
  {
    "id": "api.providers",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/providers",
      "en": "/api/admin/providers"
    },
    "keywords": [
      "api",
      "admin",
      "providers"
    ],
    "route": "/api/admin/providers",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.providers",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/providers/route.ts"
  },
  {
    "id": "api.providers_logo",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/providers/logo",
      "en": "/api/admin/providers/logo"
    },
    "keywords": [
      "api",
      "admin",
      "providers",
      "logo"
    ],
    "route": "/api/admin/providers/logo",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/providers/logo/route.ts"
  },
  {
    "id": "api.providers_test",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/providers/test",
      "en": "/api/admin/providers/test"
    },
    "keywords": [
      "api",
      "admin",
      "providers",
      "test"
    ],
    "route": "/api/admin/providers/test",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/providers/test/route.ts"
  },
  {
    "id": "api.publish_agent",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/agent",
      "en": "/api/admin/publish/agent"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "agent"
    ],
    "route": "/api/admin/publish/agent",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.publish_agent",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/agent/route.ts"
  },
  {
    "id": "api.publish_analytics",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/analytics",
      "en": "/api/admin/publish/analytics"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "analytics"
    ],
    "route": "/api/admin/publish/analytics",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.publish_analytics",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/publish/analytics/route.ts"
  },
  {
    "id": "api.publish_analytics__channelId",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/analytics/:channelId",
      "en": "/api/admin/publish/analytics/:channelId"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "analytics",
      ":channelid"
    ],
    "route": "/api/admin/publish/analytics/:channelId",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.publish_analytics_channelId",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/publish/analytics/[channelId]/route.ts"
  },
  {
    "id": "api.publish_analytics_post__postId",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/analytics/post/:postId",
      "en": "/api/admin/publish/analytics/post/:postId"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "analytics",
      "post",
      ":postid"
    ],
    "route": "/api/admin/publish/analytics/post/:postId",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.publish_analytics_post_postId",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/publish/analytics/post/[postId]/route.ts"
  },
  {
    "id": "api.publish_channels",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/channels",
      "en": "/api/admin/publish/channels"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "channels"
    ],
    "route": "/api/admin/publish/channels",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.publish_channels",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/channels/route.ts"
  },
  {
    "id": "api.publish_channels__id",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/channels/:id",
      "en": "/api/admin/publish/channels/:id"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "channels",
      ":id"
    ],
    "route": "/api/admin/publish/channels/:id",
    "methods": [
      "GET",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.publish_channels_id",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/channels/[id]/route.ts"
  },
  {
    "id": "api.publish_image",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/image",
      "en": "/api/admin/publish/image"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "image"
    ],
    "route": "/api/admin/publish/image",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/image/route.ts"
  },
  {
    "id": "api.publish_media",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/media",
      "en": "/api/admin/publish/media"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "media"
    ],
    "route": "/api/admin/publish/media",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.publish_media",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/media/route.ts"
  },
  {
    "id": "api.publish_missing-release",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/missing-release",
      "en": "/api/admin/publish/missing-release"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "missing-release"
    ],
    "route": "/api/admin/publish/missing-release",
    "methods": [
      "GET",
      "PUT",
      "PATCH"
    ],
    "capabilityRefs": [
      "probe.publish_missing_release",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/missing-release/route.ts"
  },
  {
    "id": "api.publish_plugs",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/plugs",
      "en": "/api/admin/publish/plugs"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "plugs"
    ],
    "route": "/api/admin/publish/plugs",
    "methods": [
      "GET",
      "POST",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.publish_plugs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/plugs/route.ts"
  },
  {
    "id": "api.publish_posts",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/posts",
      "en": "/api/admin/publish/posts"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "posts"
    ],
    "route": "/api/admin/publish/posts",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.publish_posts",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/posts/route.ts"
  },
  {
    "id": "api.publish_posts__id",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/posts/:id",
      "en": "/api/admin/publish/posts/:id"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "posts",
      ":id"
    ],
    "route": "/api/admin/publish/posts/:id",
    "methods": [
      "GET",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.publish_posts_id",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/posts/[id]/route.ts"
  },
  {
    "id": "api.publish_posts__id_publish-now",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/posts/:id/publish-now",
      "en": "/api/admin/publish/posts/:id/publish-now"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "posts",
      ":id",
      "publish-now"
    ],
    "route": "/api/admin/publish/posts/:id/publish-now",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/posts/[id]/publish-now/route.ts"
  },
  {
    "id": "api.publish_posts__id_status",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/posts/:id/status",
      "en": "/api/admin/publish/posts/:id/status"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "posts",
      ":id",
      "status"
    ],
    "route": "/api/admin/publish/posts/:id/status",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/posts/[id]/status/route.ts"
  },
  {
    "id": "api.publish_request-approval",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/request-approval",
      "en": "/api/admin/publish/request-approval"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "request-approval"
    ],
    "route": "/api/admin/publish/request-approval",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/request-approval/route.ts"
  },
  {
    "id": "api.publish_rss",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/rss",
      "en": "/api/admin/publish/rss"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "rss"
    ],
    "route": "/api/admin/publish/rss",
    "methods": [
      "GET",
      "POST",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.publish_rss",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/rss/route.ts"
  },
  {
    "id": "api.publish_sets",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/sets",
      "en": "/api/admin/publish/sets"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "sets"
    ],
    "route": "/api/admin/publish/sets",
    "methods": [
      "GET",
      "POST",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.publish_sets",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/sets/route.ts"
  },
  {
    "id": "api.publish_settings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/settings",
      "en": "/api/admin/publish/settings"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "settings"
    ],
    "route": "/api/admin/publish/settings",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.publish_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/settings/route.ts"
  },
  {
    "id": "api.publish_signatures",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/signatures",
      "en": "/api/admin/publish/signatures"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "signatures"
    ],
    "route": "/api/admin/publish/signatures",
    "methods": [
      "GET",
      "POST",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.publish_signatures",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/signatures/route.ts"
  },
  {
    "id": "api.publish_tick",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/tick",
      "en": "/api/admin/publish/tick"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "tick"
    ],
    "route": "/api/admin/publish/tick",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.publish_tick",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/tick/route.ts"
  },
  {
    "id": "api.publish_upload-from-url",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/upload-from-url",
      "en": "/api/admin/publish/upload-from-url"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "upload-from-url"
    ],
    "route": "/api/admin/publish/upload-from-url",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/upload-from-url/route.ts"
  },
  {
    "id": "api.publish_video",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/video",
      "en": "/api/admin/publish/video"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "video"
    ],
    "route": "/api/admin/publish/video",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.publish_video",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/video/route.ts"
  },
  {
    "id": "api.publish_webhooks",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/publish/webhooks",
      "en": "/api/admin/publish/webhooks"
    },
    "keywords": [
      "api",
      "admin",
      "publish",
      "webhooks"
    ],
    "route": "/api/admin/publish/webhooks",
    "methods": [
      "GET",
      "POST",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.publish_webhooks",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/publish/webhooks/route.ts"
  },
  {
    "id": "api.push_public-key",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/push/public-key",
      "en": "/api/admin/push/public-key"
    },
    "keywords": [
      "api",
      "admin",
      "push",
      "public-key"
    ],
    "route": "/api/admin/push/public-key",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.push_public_key",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/push/public-key/route.ts"
  },
  {
    "id": "api.push_subscribe",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/push/subscribe",
      "en": "/api/admin/push/subscribe"
    },
    "keywords": [
      "api",
      "admin",
      "push",
      "subscribe"
    ],
    "route": "/api/admin/push/subscribe",
    "methods": [
      "POST",
      "DELETE"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/push/subscribe/route.ts"
  },
  {
    "id": "api.pwa",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/pwa",
      "en": "/api/admin/pwa"
    },
    "keywords": [
      "api",
      "admin",
      "pwa"
    ],
    "route": "/api/admin/pwa",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.pwa",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/pwa/route.ts"
  },
  {
    "id": "api.pwa_icon",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/pwa/icon",
      "en": "/api/admin/pwa/icon"
    },
    "keywords": [
      "api",
      "admin",
      "pwa",
      "icon"
    ],
    "route": "/api/admin/pwa/icon",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/pwa/icon/route.ts"
  },
  {
    "id": "api.resale_b2b-bookings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/b2b-bookings",
      "en": "/api/admin/resale/b2b-bookings"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "b2b-bookings"
    ],
    "route": "/api/admin/resale/b2b-bookings",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.resale_b2b_bookings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/resale/b2b-bookings/route.ts"
  },
  {
    "id": "api.resale_companies",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/companies",
      "en": "/api/admin/resale/companies"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "companies"
    ],
    "route": "/api/admin/resale/companies",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.resale_companies",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/companies/route.ts"
  },
  {
    "id": "api.resale_domains",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/domains",
      "en": "/api/admin/resale/domains"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "domains"
    ],
    "route": "/api/admin/resale/domains",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.resale_domains",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/domains/route.ts"
  },
  {
    "id": "api.resale_licenses",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/licenses",
      "en": "/api/admin/resale/licenses"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "licenses"
    ],
    "route": "/api/admin/resale/licenses",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.resale_licenses",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/licenses/route.ts"
  },
  {
    "id": "api.resale_marketing_email_campaign",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/marketing/email/campaign",
      "en": "/api/admin/resale/marketing/email/campaign"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "marketing",
      "email",
      "campaign"
    ],
    "route": "/api/admin/resale/marketing/email/campaign",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/marketing/email/campaign/route.ts"
  },
  {
    "id": "api.resale_marketing_email_send",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/marketing/email/send",
      "en": "/api/admin/resale/marketing/email/send"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "marketing",
      "email",
      "send"
    ],
    "route": "/api/admin/resale/marketing/email/send",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/marketing/email/send/route.ts"
  },
  {
    "id": "api.resale_marketing_email_settings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/marketing/email/settings",
      "en": "/api/admin/resale/marketing/email/settings"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "marketing",
      "email",
      "settings"
    ],
    "route": "/api/admin/resale/marketing/email/settings",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.resale_marketing_email_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/marketing/email/settings/route.ts"
  },
  {
    "id": "api.resale_marketing_email_verify",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/marketing/email/verify",
      "en": "/api/admin/resale/marketing/email/verify"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "marketing",
      "email",
      "verify"
    ],
    "route": "/api/admin/resale/marketing/email/verify",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/marketing/email/verify/route.ts"
  },
  {
    "id": "api.resale_marketing_whatsapp_send",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/marketing/whatsapp/send",
      "en": "/api/admin/resale/marketing/whatsapp/send"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "marketing",
      "whatsapp",
      "send"
    ],
    "route": "/api/admin/resale/marketing/whatsapp/send",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/marketing/whatsapp/send/route.ts"
  },
  {
    "id": "api.resale_overview",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/overview",
      "en": "/api/admin/resale/overview"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "overview"
    ],
    "route": "/api/admin/resale/overview",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.resale_overview",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/resale/overview/route.ts"
  },
  {
    "id": "api.resale_scraper_ai-studio",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/scraper/ai-studio",
      "en": "/api/admin/resale/scraper/ai-studio"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "scraper",
      "ai-studio"
    ],
    "route": "/api/admin/resale/scraper/ai-studio",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/scraper/ai-studio/route.ts"
  },
  {
    "id": "api.resale_scraper_campaigns",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/scraper/campaigns",
      "en": "/api/admin/resale/scraper/campaigns"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "scraper",
      "campaigns"
    ],
    "route": "/api/admin/resale/scraper/campaigns",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.resale_scraper_campaigns",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/scraper/campaigns/route.ts"
  },
  {
    "id": "api.resale_scraper_export",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/scraper/export",
      "en": "/api/admin/resale/scraper/export"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "scraper",
      "export"
    ],
    "route": "/api/admin/resale/scraper/export",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/scraper/export/route.ts"
  },
  {
    "id": "api.resale_scraper_jobs",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/scraper/jobs",
      "en": "/api/admin/resale/scraper/jobs"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "scraper",
      "jobs"
    ],
    "route": "/api/admin/resale/scraper/jobs",
    "methods": [
      "GET",
      "POST",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.resale_scraper_jobs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/scraper/jobs/route.ts"
  },
  {
    "id": "api.resale_scraper_leads",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/scraper/leads",
      "en": "/api/admin/resale/scraper/leads"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "scraper",
      "leads"
    ],
    "route": "/api/admin/resale/scraper/leads",
    "methods": [
      "GET",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.resale_scraper_leads",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/scraper/leads/route.ts"
  },
  {
    "id": "api.resale_scraper_live-crawler",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/scraper/live-crawler",
      "en": "/api/admin/resale/scraper/live-crawler"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "scraper",
      "live-crawler"
    ],
    "route": "/api/admin/resale/scraper/live-crawler",
    "methods": [
      "GET",
      "POST",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.resale_scraper_live_crawler",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/scraper/live-crawler/route.ts"
  },
  {
    "id": "api.resale_scraper_templates",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/scraper/templates",
      "en": "/api/admin/resale/scraper/templates"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "scraper",
      "templates"
    ],
    "route": "/api/admin/resale/scraper/templates",
    "methods": [
      "GET",
      "POST",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.resale_scraper_templates",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/scraper/templates/route.ts"
  },
  {
    "id": "api.resale_settings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/settings",
      "en": "/api/admin/resale/settings"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "settings"
    ],
    "route": "/api/admin/resale/settings",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.resale_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/settings/route.ts"
  },
  {
    "id": "api.resale_subscriptions",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/subscriptions",
      "en": "/api/admin/resale/subscriptions"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "subscriptions"
    ],
    "route": "/api/admin/resale/subscriptions",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.resale_subscriptions",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/subscriptions/route.ts"
  },
  {
    "id": "api.resale_wallets",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/wallets",
      "en": "/api/admin/resale/wallets"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "wallets"
    ],
    "route": "/api/admin/resale/wallets",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.resale_wallets",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/wallets/route.ts"
  },
  {
    "id": "api.resale_whitelabel",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/resale/whitelabel",
      "en": "/api/admin/resale/whitelabel"
    },
    "keywords": [
      "api",
      "admin",
      "resale",
      "whitelabel"
    ],
    "route": "/api/admin/resale/whitelabel",
    "methods": [
      "GET",
      "POST",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.resale_whitelabel",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/resale/whitelabel/route.ts"
  },
  {
    "id": "api.reviews",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/reviews",
      "en": "/api/admin/reviews"
    },
    "keywords": [
      "api",
      "admin",
      "reviews"
    ],
    "route": "/api/admin/reviews",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.reviews",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/reviews/route.ts"
  },
  {
    "id": "api.reviews_agent",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/reviews/agent",
      "en": "/api/admin/reviews/agent"
    },
    "keywords": [
      "api",
      "admin",
      "reviews",
      "agent"
    ],
    "route": "/api/admin/reviews/agent",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.reviews_agent",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/reviews/agent/route.ts"
  },
  {
    "id": "api.search-tabs",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/search-tabs",
      "en": "/api/admin/search-tabs"
    },
    "keywords": [
      "api",
      "admin",
      "search-tabs"
    ],
    "route": "/api/admin/search-tabs",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.search_tabs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/search-tabs/route.ts"
  },
  {
    "id": "api.session",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/session",
      "en": "/api/admin/session"
    },
    "keywords": [
      "api",
      "admin",
      "session"
    ],
    "route": "/api/admin/session",
    "methods": [
      "GET",
      "POST",
      "DELETE"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/session/route.ts"
  },
  {
    "id": "api.site-contact",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/site-contact",
      "en": "/api/admin/site-contact"
    },
    "keywords": [
      "api",
      "admin",
      "site-contact"
    ],
    "route": "/api/admin/site-contact",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.site_contact",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/site-contact/route.ts"
  },
  {
    "id": "api.social-community",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/social-community",
      "en": "/api/admin/social-community"
    },
    "keywords": [
      "api",
      "admin",
      "social-community"
    ],
    "route": "/api/admin/social-community",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.social_community",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/social-community/route.ts"
  },
  {
    "id": "api.social-community_test-relays",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/social-community/test-relays",
      "en": "/api/admin/social-community/test-relays"
    },
    "keywords": [
      "api",
      "admin",
      "social-community",
      "test-relays"
    ],
    "route": "/api/admin/social-community/test-relays",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/social-community/test-relays/route.ts"
  },
  {
    "id": "api.studio_agents",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/agents",
      "en": "/api/admin/studio/agents"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "agents"
    ],
    "route": "/api/admin/studio/agents",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.studio_agents",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/studio/agents/route.ts"
  },
  {
    "id": "api.studio_agents_delegate",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/agents/delegate",
      "en": "/api/admin/studio/agents/delegate"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "agents",
      "delegate"
    ],
    "route": "/api/admin/studio/agents/delegate",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/studio/agents/delegate/route.ts"
  },
  {
    "id": "api.studio_agents_speak",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/agents/speak",
      "en": "/api/admin/studio/agents/speak"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "agents",
      "speak"
    ],
    "route": "/api/admin/studio/agents/speak",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/studio/agents/speak/route.ts"
  },
  {
    "id": "api.studio_briefing",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/briefing",
      "en": "/api/admin/studio/briefing"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "briefing"
    ],
    "route": "/api/admin/studio/briefing",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.studio_briefing",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/studio/briefing/route.ts"
  },
  {
    "id": "api.studio_capabilities",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/capabilities",
      "en": "/api/admin/studio/capabilities"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "capabilities"
    ],
    "route": "/api/admin/studio/capabilities",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "low",
    "evidence": "src/app/api/admin/studio/capabilities/route.ts"
  },
  {
    "id": "api.studio_capabilities_execute",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/capabilities/execute",
      "en": "/api/admin/studio/capabilities/execute"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "capabilities",
      "execute"
    ],
    "route": "/api/admin/studio/capabilities/execute",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/studio/capabilities/execute/route.ts"
  },
  {
    "id": "api.studio_live",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/live",
      "en": "/api/admin/studio/live"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "live"
    ],
    "route": "/api/admin/studio/live",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.studio_live",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/studio/live/route.ts"
  },
  {
    "id": "api.studio_loops_execute",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/loops/execute",
      "en": "/api/admin/studio/loops/execute"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "loops",
      "execute"
    ],
    "route": "/api/admin/studio/loops/execute",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/studio/loops/execute/route.ts"
  },
  {
    "id": "api.studio_loops_preflight",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/loops/preflight",
      "en": "/api/admin/studio/loops/preflight"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "loops",
      "preflight"
    ],
    "route": "/api/admin/studio/loops/preflight",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.studio_loops_preflight",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/studio/loops/preflight/route.ts"
  },
  {
    "id": "api.studio_loops_state",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/loops/state",
      "en": "/api/admin/studio/loops/state"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "loops",
      "state"
    ],
    "route": "/api/admin/studio/loops/state",
    "methods": [
      "GET",
      "POST"
    ],
    "capabilityRefs": [
      "probe.studio_loops_state",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/studio/loops/state/route.ts"
  },
  {
    "id": "api.studio_nexus_metrics",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/nexus/metrics",
      "en": "/api/admin/studio/nexus/metrics"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "nexus",
      "metrics"
    ],
    "route": "/api/admin/studio/nexus/metrics",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.studio_nexus_metrics",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/studio/nexus/metrics/route.ts"
  },
  {
    "id": "api.studio_records",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/records",
      "en": "/api/admin/studio/records"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "records"
    ],
    "route": "/api/admin/studio/records",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.studio_records",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/studio/records/route.ts"
  },
  {
    "id": "api.studio_schema",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/studio/schema",
      "en": "/api/admin/studio/schema"
    },
    "keywords": [
      "api",
      "admin",
      "studio",
      "schema"
    ],
    "route": "/api/admin/studio/schema",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.studio_schema",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/studio/schema/route.ts"
  },
  {
    "id": "api.tenant-plan",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/tenant-plan",
      "en": "/api/admin/tenant-plan"
    },
    "keywords": [
      "api",
      "admin",
      "tenant-plan"
    ],
    "route": "/api/admin/tenant-plan",
    "methods": [
      "GET"
    ],
    "capabilityRefs": [
      "probe.tenant_plan",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "src/app/api/admin/tenant-plan/route.ts"
  },
  {
    "id": "api.theme",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/theme",
      "en": "/api/admin/theme"
    },
    "keywords": [
      "api",
      "admin",
      "theme"
    ],
    "route": "/api/admin/theme",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.theme",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/theme/route.ts"
  },
  {
    "id": "api.tours",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/tours",
      "en": "/api/admin/tours"
    },
    "keywords": [
      "api",
      "admin",
      "tours"
    ],
    "route": "/api/admin/tours",
    "methods": [
      "GET",
      "PATCH",
      "DELETE"
    ],
    "capabilityRefs": [
      "probe.tours",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/tours/route.ts"
  },
  {
    "id": "api.transfers-settings",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/transfers-settings",
      "en": "/api/admin/transfers-settings"
    },
    "keywords": [
      "api",
      "admin",
      "transfers-settings"
    ],
    "route": "/api/admin/transfers-settings",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.transfers_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/transfers-settings/route.ts"
  },
  {
    "id": "api.translations",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/translations",
      "en": "/api/admin/translations"
    },
    "keywords": [
      "api",
      "admin",
      "translations"
    ],
    "route": "/api/admin/translations",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.translations",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/translations/route.ts"
  },
  {
    "id": "api.translations_languages",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/translations/languages",
      "en": "/api/admin/translations/languages"
    },
    "keywords": [
      "api",
      "admin",
      "translations",
      "languages"
    ],
    "route": "/api/admin/translations/languages",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/translations/languages/route.ts"
  },
  {
    "id": "api.translations_translate-batch",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/translations/translate-batch",
      "en": "/api/admin/translations/translate-batch"
    },
    "keywords": [
      "api",
      "admin",
      "translations",
      "translate-batch"
    ],
    "route": "/api/admin/translations/translate-batch",
    "methods": [
      "POST"
    ],
    "capabilityRefs": [
      "admin.route.call"
    ],
    "defaultIntent": "command",
    "risk": "medium",
    "evidence": "src/app/api/admin/translations/translate-batch/route.ts"
  },
  {
    "id": "api.ui-icons",
    "kind": "api_route",
    "labels": {
      "ar": "/api/admin/ui-icons",
      "en": "/api/admin/ui-icons"
    },
    "keywords": [
      "api",
      "admin",
      "ui-icons"
    ],
    "route": "/api/admin/ui-icons",
    "methods": [
      "GET",
      "PUT"
    ],
    "capabilityRefs": [
      "probe.ui_icons",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "medium",
    "evidence": "src/app/api/admin/ui-icons/route.ts"
  },
  {
    "id": "collection.admin_notifications",
    "kind": "collection",
    "labels": {
      "ar": "admin_notifications",
      "en": "admin_notifications"
    },
    "keywords": [
      "admin_notifications",
      "admin",
      "notifications"
    ],
    "collection": "admin_notifications",
    "capabilityRefs": [
      "collection.admin_notifications.list",
      "collection.admin_notifications.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.affiliate_conversions",
    "kind": "collection",
    "labels": {
      "ar": "affiliate_conversions",
      "en": "affiliate_conversions"
    },
    "keywords": [
      "affiliate_conversions",
      "affiliate",
      "conversions"
    ],
    "collection": "affiliate_conversions",
    "capabilityRefs": [
      "collection.affiliate_conversions.list",
      "collection.affiliate_conversions.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.affiliate_profiles",
    "kind": "collection",
    "labels": {
      "ar": "affiliate_profiles",
      "en": "affiliate_profiles"
    },
    "keywords": [
      "affiliate_profiles",
      "affiliate",
      "profiles"
    ],
    "collection": "affiliate_profiles",
    "capabilityRefs": [
      "collection.affiliate_profiles.list",
      "collection.affiliate_profiles.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.affiliate_settings",
    "kind": "collection",
    "labels": {
      "ar": "affiliate_settings",
      "en": "affiliate_settings"
    },
    "keywords": [
      "affiliate_settings",
      "affiliate",
      "settings"
    ],
    "collection": "affiliate_settings",
    "capabilityRefs": [
      "collection.affiliate_settings.list",
      "collection.affiliate_settings.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.affiliate_visits",
    "kind": "collection",
    "labels": {
      "ar": "affiliate_visits",
      "en": "affiliate_visits"
    },
    "keywords": [
      "affiliate_visits",
      "affiliate",
      "visits"
    ],
    "collection": "affiliate_visits",
    "capabilityRefs": [
      "collection.affiliate_visits.list",
      "collection.affiliate_visits.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.affiliate_withdrawals",
    "kind": "collection",
    "labels": {
      "ar": "affiliate_withdrawals",
      "en": "affiliate_withdrawals"
    },
    "keywords": [
      "affiliate_withdrawals",
      "affiliate",
      "withdrawals"
    ],
    "collection": "affiliate_withdrawals",
    "capabilityRefs": [
      "collection.affiliate_withdrawals.list",
      "collection.affiliate_withdrawals.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.ai_conversations",
    "kind": "collection",
    "labels": {
      "ar": "ai_conversations",
      "en": "ai_conversations"
    },
    "keywords": [
      "ai_conversations",
      "ai",
      "conversations"
    ],
    "collection": "ai_conversations",
    "capabilityRefs": [
      "collection.ai_conversations.list",
      "collection.ai_conversations.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.ai_programs",
    "kind": "collection",
    "labels": {
      "ar": "ai_programs",
      "en": "ai_programs"
    },
    "keywords": [
      "ai_programs",
      "ai",
      "programs"
    ],
    "collection": "ai_programs",
    "capabilityRefs": [
      "collection.ai_programs.list",
      "collection.ai_programs.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.articles",
    "kind": "collection",
    "labels": {
      "ar": "articles",
      "en": "articles"
    },
    "keywords": [
      "articles"
    ],
    "collection": "articles",
    "capabilityRefs": [
      "collection.articles.list",
      "collection.articles.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.crm_leads",
    "kind": "collection",
    "labels": {
      "ar": "crm_leads",
      "en": "crm_leads"
    },
    "keywords": [
      "crm_leads",
      "crm",
      "leads"
    ],
    "collection": "crm_leads",
    "capabilityRefs": [
      "collection.crm_leads.list",
      "collection.crm_leads.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.customer_reviews",
    "kind": "collection",
    "labels": {
      "ar": "customer_reviews",
      "en": "customer_reviews"
    },
    "keywords": [
      "customer_reviews",
      "customer",
      "reviews"
    ],
    "collection": "customer_reviews",
    "capabilityRefs": [
      "collection.customer_reviews.list",
      "collection.customer_reviews.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.customers",
    "kind": "collection",
    "labels": {
      "ar": "customers",
      "en": "customers"
    },
    "keywords": [
      "customers"
    ],
    "collection": "customers",
    "capabilityRefs": [
      "collection.customers.list",
      "collection.customers.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "high",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.email_campaigns",
    "kind": "collection",
    "labels": {
      "ar": "email_campaigns",
      "en": "email_campaigns"
    },
    "keywords": [
      "email_campaigns",
      "email",
      "campaigns"
    ],
    "collection": "email_campaigns",
    "capabilityRefs": [
      "collection.email_campaigns.list",
      "collection.email_campaigns.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.email_recipients",
    "kind": "collection",
    "labels": {
      "ar": "email_recipients",
      "en": "email_recipients"
    },
    "keywords": [
      "email_recipients",
      "email",
      "recipients"
    ],
    "collection": "email_recipients",
    "capabilityRefs": [
      "collection.email_recipients.list",
      "collection.email_recipients.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.email_templates",
    "kind": "collection",
    "labels": {
      "ar": "email_templates",
      "en": "email_templates"
    },
    "keywords": [
      "email_templates",
      "email",
      "templates"
    ],
    "collection": "email_templates",
    "capabilityRefs": [
      "collection.email_templates.list",
      "collection.email_templates.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.enquiry_bookings",
    "kind": "collection",
    "labels": {
      "ar": "enquiry_bookings",
      "en": "enquiry_bookings"
    },
    "keywords": [
      "enquiry_bookings",
      "enquiry",
      "bookings"
    ],
    "collection": "enquiry_bookings",
    "capabilityRefs": [
      "collection.enquiry_bookings.list",
      "collection.enquiry_bookings.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.financial_transactions",
    "kind": "collection",
    "labels": {
      "ar": "financial_transactions",
      "en": "financial_transactions"
    },
    "keywords": [
      "financial_transactions",
      "financial",
      "transactions"
    ],
    "collection": "financial_transactions",
    "capabilityRefs": [
      "collection.financial_transactions.list",
      "collection.financial_transactions.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "high",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.geo_places",
    "kind": "collection",
    "labels": {
      "ar": "geo_places",
      "en": "geo_places"
    },
    "keywords": [
      "geo_places",
      "geo",
      "places"
    ],
    "collection": "geo_places",
    "capabilityRefs": [
      "collection.geo_places.list",
      "collection.geo_places.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_bookings",
    "kind": "collection",
    "labels": {
      "ar": "hotel_bookings",
      "en": "hotel_bookings"
    },
    "keywords": [
      "hotel_bookings",
      "hotel",
      "bookings"
    ],
    "collection": "hotel_bookings",
    "capabilityRefs": [
      "collection.hotel_bookings.list",
      "collection.hotel_bookings.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_content_jobs",
    "kind": "collection",
    "labels": {
      "ar": "hotel_content_jobs",
      "en": "hotel_content_jobs"
    },
    "keywords": [
      "hotel_content_jobs",
      "hotel",
      "content",
      "jobs"
    ],
    "collection": "hotel_content_jobs",
    "capabilityRefs": [
      "collection.hotel_content_jobs.list",
      "collection.hotel_content_jobs.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_destinations",
    "kind": "collection",
    "labels": {
      "ar": "hotel_destinations",
      "en": "hotel_destinations"
    },
    "keywords": [
      "hotel_destinations",
      "hotel",
      "destinations"
    ],
    "collection": "hotel_destinations",
    "capabilityRefs": [
      "collection.hotel_destinations.list",
      "collection.hotel_destinations.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_facilities",
    "kind": "collection",
    "labels": {
      "ar": "hotel_facilities",
      "en": "hotel_facilities"
    },
    "keywords": [
      "hotel_facilities",
      "hotel",
      "facilities"
    ],
    "collection": "hotel_facilities",
    "capabilityRefs": [
      "collection.hotel_facilities.list",
      "collection.hotel_facilities.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_guest_reviews",
    "kind": "collection",
    "labels": {
      "ar": "hotel_guest_reviews",
      "en": "hotel_guest_reviews"
    },
    "keywords": [
      "hotel_guest_reviews",
      "hotel",
      "guest",
      "reviews"
    ],
    "collection": "hotel_guest_reviews",
    "capabilityRefs": [
      "collection.hotel_guest_reviews.list",
      "collection.hotel_guest_reviews.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_identity_reviews",
    "kind": "collection",
    "labels": {
      "ar": "hotel_identity_reviews",
      "en": "hotel_identity_reviews"
    },
    "keywords": [
      "hotel_identity_reviews",
      "hotel",
      "identity",
      "reviews"
    ],
    "collection": "hotel_identity_reviews",
    "capabilityRefs": [
      "collection.hotel_identity_reviews.list",
      "collection.hotel_identity_reviews.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_images",
    "kind": "collection",
    "labels": {
      "ar": "hotel_images",
      "en": "hotel_images"
    },
    "keywords": [
      "hotel_images",
      "hotel",
      "images"
    ],
    "collection": "hotel_images",
    "capabilityRefs": [
      "collection.hotel_images.list",
      "collection.hotel_images.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_masters",
    "kind": "collection",
    "labels": {
      "ar": "hotel_masters",
      "en": "hotel_masters"
    },
    "keywords": [
      "hotel_masters",
      "hotel",
      "masters"
    ],
    "collection": "hotel_masters",
    "capabilityRefs": [
      "collection.hotel_masters.list",
      "collection.hotel_masters.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_pois",
    "kind": "collection",
    "labels": {
      "ar": "hotel_pois",
      "en": "hotel_pois"
    },
    "keywords": [
      "hotel_pois",
      "hotel",
      "pois"
    ],
    "collection": "hotel_pois",
    "capabilityRefs": [
      "collection.hotel_pois.list",
      "collection.hotel_pois.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_quotes",
    "kind": "collection",
    "labels": {
      "ar": "hotel_quotes",
      "en": "hotel_quotes"
    },
    "keywords": [
      "hotel_quotes",
      "hotel",
      "quotes"
    ],
    "collection": "hotel_quotes",
    "capabilityRefs": [
      "collection.hotel_quotes.list",
      "collection.hotel_quotes.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_review_scores",
    "kind": "collection",
    "labels": {
      "ar": "hotel_review_scores",
      "en": "hotel_review_scores"
    },
    "keywords": [
      "hotel_review_scores",
      "hotel",
      "review",
      "scores"
    ],
    "collection": "hotel_review_scores",
    "capabilityRefs": [
      "collection.hotel_review_scores.list",
      "collection.hotel_review_scores.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_rooms_content",
    "kind": "collection",
    "labels": {
      "ar": "hotel_rooms_content",
      "en": "hotel_rooms_content"
    },
    "keywords": [
      "hotel_rooms_content",
      "hotel",
      "rooms",
      "content"
    ],
    "collection": "hotel_rooms_content",
    "capabilityRefs": [
      "collection.hotel_rooms_content.list",
      "collection.hotel_rooms_content.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.hotel_supplier_refs",
    "kind": "collection",
    "labels": {
      "ar": "hotel_supplier_refs",
      "en": "hotel_supplier_refs"
    },
    "keywords": [
      "hotel_supplier_refs",
      "hotel",
      "supplier",
      "refs"
    ],
    "collection": "hotel_supplier_refs",
    "capabilityRefs": [
      "collection.hotel_supplier_refs.list",
      "collection.hotel_supplier_refs.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.loyalty_wallets",
    "kind": "collection",
    "labels": {
      "ar": "loyalty_wallets",
      "en": "loyalty_wallets"
    },
    "keywords": [
      "loyalty_wallets",
      "loyalty",
      "wallets"
    ],
    "collection": "loyalty_wallets",
    "capabilityRefs": [
      "collection.loyalty_wallets.list",
      "collection.loyalty_wallets.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "high",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.owned_hotels",
    "kind": "collection",
    "labels": {
      "ar": "owned_hotels",
      "en": "owned_hotels"
    },
    "keywords": [
      "owned_hotels",
      "owned",
      "hotels"
    ],
    "collection": "owned_hotels",
    "capabilityRefs": [
      "collection.owned_hotels.list",
      "collection.owned_hotels.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.owned_rate_snapshots",
    "kind": "collection",
    "labels": {
      "ar": "owned_rate_snapshots",
      "en": "owned_rate_snapshots"
    },
    "keywords": [
      "owned_rate_snapshots",
      "owned",
      "rate",
      "snapshots"
    ],
    "collection": "owned_rate_snapshots",
    "capabilityRefs": [
      "collection.owned_rate_snapshots.list",
      "collection.owned_rate_snapshots.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_channel_groups",
    "kind": "collection",
    "labels": {
      "ar": "publish_channel_groups",
      "en": "publish_channel_groups"
    },
    "keywords": [
      "publish_channel_groups",
      "publish",
      "channel",
      "groups"
    ],
    "collection": "publish_channel_groups",
    "capabilityRefs": [
      "collection.publish_channel_groups.list",
      "collection.publish_channel_groups.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_channels",
    "kind": "collection",
    "labels": {
      "ar": "publish_channels",
      "en": "publish_channels"
    },
    "keywords": [
      "publish_channels",
      "publish",
      "channels"
    ],
    "collection": "publish_channels",
    "capabilityRefs": [
      "collection.publish_channels.list",
      "collection.publish_channels.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_errors",
    "kind": "collection",
    "labels": {
      "ar": "publish_errors",
      "en": "publish_errors"
    },
    "keywords": [
      "publish_errors",
      "publish",
      "errors"
    ],
    "collection": "publish_errors",
    "capabilityRefs": [
      "collection.publish_errors.list",
      "collection.publish_errors.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_media",
    "kind": "collection",
    "labels": {
      "ar": "publish_media",
      "en": "publish_media"
    },
    "keywords": [
      "publish_media",
      "publish",
      "media"
    ],
    "collection": "publish_media",
    "capabilityRefs": [
      "collection.publish_media.list",
      "collection.publish_media.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_mentions",
    "kind": "collection",
    "labels": {
      "ar": "publish_mentions",
      "en": "publish_mentions"
    },
    "keywords": [
      "publish_mentions",
      "publish",
      "mentions"
    ],
    "collection": "publish_mentions",
    "capabilityRefs": [
      "collection.publish_mentions.list",
      "collection.publish_mentions.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_notifications",
    "kind": "collection",
    "labels": {
      "ar": "publish_notifications",
      "en": "publish_notifications"
    },
    "keywords": [
      "publish_notifications",
      "publish",
      "notifications"
    ],
    "collection": "publish_notifications",
    "capabilityRefs": [
      "collection.publish_notifications.list",
      "collection.publish_notifications.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_plugs",
    "kind": "collection",
    "labels": {
      "ar": "publish_plugs",
      "en": "publish_plugs"
    },
    "keywords": [
      "publish_plugs",
      "publish",
      "plugs"
    ],
    "collection": "publish_plugs",
    "capabilityRefs": [
      "collection.publish_plugs.list",
      "collection.publish_plugs.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_post_comments",
    "kind": "collection",
    "labels": {
      "ar": "publish_post_comments",
      "en": "publish_post_comments"
    },
    "keywords": [
      "publish_post_comments",
      "publish",
      "post",
      "comments"
    ],
    "collection": "publish_post_comments",
    "capabilityRefs": [
      "collection.publish_post_comments.list",
      "collection.publish_post_comments.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_posts",
    "kind": "collection",
    "labels": {
      "ar": "publish_posts",
      "en": "publish_posts"
    },
    "keywords": [
      "publish_posts",
      "publish",
      "posts"
    ],
    "collection": "publish_posts",
    "capabilityRefs": [
      "collection.publish_posts.list",
      "collection.publish_posts.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_rss_feeds",
    "kind": "collection",
    "labels": {
      "ar": "publish_rss_feeds",
      "en": "publish_rss_feeds"
    },
    "keywords": [
      "publish_rss_feeds",
      "publish",
      "rss",
      "feeds"
    ],
    "collection": "publish_rss_feeds",
    "capabilityRefs": [
      "collection.publish_rss_feeds.list",
      "collection.publish_rss_feeds.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_sets",
    "kind": "collection",
    "labels": {
      "ar": "publish_sets",
      "en": "publish_sets"
    },
    "keywords": [
      "publish_sets",
      "publish",
      "sets"
    ],
    "collection": "publish_sets",
    "capabilityRefs": [
      "collection.publish_sets.list",
      "collection.publish_sets.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_signatures",
    "kind": "collection",
    "labels": {
      "ar": "publish_signatures",
      "en": "publish_signatures"
    },
    "keywords": [
      "publish_signatures",
      "publish",
      "signatures"
    ],
    "collection": "publish_signatures",
    "capabilityRefs": [
      "collection.publish_signatures.list",
      "collection.publish_signatures.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_tags",
    "kind": "collection",
    "labels": {
      "ar": "publish_tags",
      "en": "publish_tags"
    },
    "keywords": [
      "publish_tags",
      "publish",
      "tags"
    ],
    "collection": "publish_tags",
    "capabilityRefs": [
      "collection.publish_tags.list",
      "collection.publish_tags.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.publish_webhooks",
    "kind": "collection",
    "labels": {
      "ar": "publish_webhooks",
      "en": "publish_webhooks"
    },
    "keywords": [
      "publish_webhooks",
      "publish",
      "webhooks"
    ],
    "collection": "publish_webhooks",
    "capabilityRefs": [
      "collection.publish_webhooks.list",
      "collection.publish_webhooks.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.reseller_companies",
    "kind": "collection",
    "labels": {
      "ar": "reseller_companies",
      "en": "reseller_companies"
    },
    "keywords": [
      "reseller_companies",
      "reseller",
      "companies"
    ],
    "collection": "reseller_companies",
    "capabilityRefs": [
      "collection.reseller_companies.list",
      "collection.reseller_companies.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.reseller_domain_events",
    "kind": "collection",
    "labels": {
      "ar": "reseller_domain_events",
      "en": "reseller_domain_events"
    },
    "keywords": [
      "reseller_domain_events",
      "reseller",
      "domain",
      "events"
    ],
    "collection": "reseller_domain_events",
    "capabilityRefs": [
      "collection.reseller_domain_events.list",
      "collection.reseller_domain_events.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.reseller_heartbeats",
    "kind": "collection",
    "labels": {
      "ar": "reseller_heartbeats",
      "en": "reseller_heartbeats"
    },
    "keywords": [
      "reseller_heartbeats",
      "reseller",
      "heartbeats"
    ],
    "collection": "reseller_heartbeats",
    "capabilityRefs": [
      "collection.reseller_heartbeats.list",
      "collection.reseller_heartbeats.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.reseller_licenses",
    "kind": "collection",
    "labels": {
      "ar": "reseller_licenses",
      "en": "reseller_licenses"
    },
    "keywords": [
      "reseller_licenses",
      "reseller",
      "licenses"
    ],
    "collection": "reseller_licenses",
    "capabilityRefs": [
      "collection.reseller_licenses.list",
      "collection.reseller_licenses.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.reseller_orders",
    "kind": "collection",
    "labels": {
      "ar": "reseller_orders",
      "en": "reseller_orders"
    },
    "keywords": [
      "reseller_orders",
      "reseller",
      "orders"
    ],
    "collection": "reseller_orders",
    "capabilityRefs": [
      "collection.reseller_orders.list",
      "collection.reseller_orders.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.reseller_progress",
    "kind": "collection",
    "labels": {
      "ar": "reseller_progress",
      "en": "reseller_progress"
    },
    "keywords": [
      "reseller_progress",
      "reseller",
      "progress"
    ],
    "collection": "reseller_progress",
    "capabilityRefs": [
      "collection.reseller_progress.list",
      "collection.reseller_progress.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.reseller_servers",
    "kind": "collection",
    "labels": {
      "ar": "reseller_servers",
      "en": "reseller_servers"
    },
    "keywords": [
      "reseller_servers",
      "reseller",
      "servers"
    ],
    "collection": "reseller_servers",
    "capabilityRefs": [
      "collection.reseller_servers.list",
      "collection.reseller_servers.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.reseller_settings",
    "kind": "collection",
    "labels": {
      "ar": "reseller_settings",
      "en": "reseller_settings"
    },
    "keywords": [
      "reseller_settings",
      "reseller",
      "settings"
    ],
    "collection": "reseller_settings",
    "capabilityRefs": [
      "collection.reseller_settings.list",
      "collection.reseller_settings.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.reseller_stage_templates",
    "kind": "collection",
    "labels": {
      "ar": "reseller_stage_templates",
      "en": "reseller_stage_templates"
    },
    "keywords": [
      "reseller_stage_templates",
      "reseller",
      "stage",
      "templates"
    ],
    "collection": "reseller_stage_templates",
    "capabilityRefs": [
      "collection.reseller_stage_templates.list",
      "collection.reseller_stage_templates.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.reseller_subscriptions",
    "kind": "collection",
    "labels": {
      "ar": "reseller_subscriptions",
      "en": "reseller_subscriptions"
    },
    "keywords": [
      "reseller_subscriptions",
      "reseller",
      "subscriptions"
    ],
    "collection": "reseller_subscriptions",
    "capabilityRefs": [
      "collection.reseller_subscriptions.list",
      "collection.reseller_subscriptions.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.reseller_whitelabel_settings",
    "kind": "collection",
    "labels": {
      "ar": "reseller_whitelabel_settings",
      "en": "reseller_whitelabel_settings"
    },
    "keywords": [
      "reseller_whitelabel_settings",
      "reseller",
      "whitelabel",
      "settings"
    ],
    "collection": "reseller_whitelabel_settings",
    "capabilityRefs": [
      "collection.reseller_whitelabel_settings.list",
      "collection.reseller_whitelabel_settings.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.site_settings",
    "kind": "collection",
    "labels": {
      "ar": "site_settings",
      "en": "site_settings"
    },
    "keywords": [
      "site_settings",
      "site",
      "settings"
    ],
    "collection": "site_settings",
    "capabilityRefs": [
      "collection.site_settings.list",
      "collection.site_settings.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.site_traffic_logs",
    "kind": "collection",
    "labels": {
      "ar": "site_traffic_logs",
      "en": "site_traffic_logs"
    },
    "keywords": [
      "site_traffic_logs",
      "site",
      "traffic",
      "logs"
    ],
    "collection": "site_traffic_logs",
    "capabilityRefs": [
      "collection.site_traffic_logs.list",
      "collection.site_traffic_logs.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "collection.users",
    "kind": "collection",
    "labels": {
      "ar": "users",
      "en": "users"
    },
    "keywords": [
      "users"
    ],
    "collection": "users",
    "capabilityRefs": [
      "collection.users.list",
      "collection.users.get",
      "records.list",
      "records.get",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "high",
    "evidence": "domain-systems.ts:KNOWN_COLLECTIONS"
  },
  {
    "id": "domain.screen.03",
    "kind": "screen",
    "screenId": "03",
    "mapId": "screen.03",
    "labels": {
      "ar": "الحجوزات والإلغاء والتقييمات"
    },
    "keywords": [
      "الحجوزات",
      "والالغاء",
      "والتقييمات",
      "والعمليات"
    ],
    "href": "/admin/bookings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.04",
    "kind": "screen",
    "screenId": "04",
    "mapId": "screen.04",
    "labels": {
      "ar": "الرحلات وموزعو GDS"
    },
    "keywords": [
      "الرحلات",
      "وموزعو",
      "gds",
      "تذاكر",
      "الطيران",
      "الخدمات"
    ],
    "href": "/admin/flights",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.05",
    "kind": "screen",
    "screenId": "05",
    "mapId": "screen.05",
    "labels": {
      "ar": "الفنادق وبنوك الأسرّة"
    },
    "keywords": [
      "الفنادق",
      "وبنوك",
      "الاسره",
      "منصه",
      "عمليات",
      "المعرفه",
      "المؤسسيه",
      "الخدمات"
    ],
    "href": "/admin/hotels",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.06",
    "kind": "screen",
    "screenId": "06",
    "mapId": "screen.06",
    "labels": {
      "ar": "النقل والجولات والباقات والتأشيرات"
    },
    "keywords": [
      "النقل",
      "والجولات",
      "والباقات",
      "والتاشيرات",
      "التنقل",
      "والفيزا",
      "الخدمات"
    ],
    "href": "/admin/packages",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.07",
    "kind": "screen",
    "screenId": "07",
    "mapId": "screen.07",
    "labels": {
      "ar": "محتوى الموقع والتطبيقات"
    },
    "keywords": [
      "محتوي",
      "الموقع",
      "والتطبيقات",
      "المحتوي",
      "وواجهه",
      "المنصه",
      "الرقميه"
    ],
    "href": "/admin/pages",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.08",
    "kind": "screen",
    "screenId": "08",
    "mapId": "screen.08",
    "labels": {
      "ar": "العملاء وخدمة العملاء"
    },
    "keywords": [
      "العملاء",
      "وخدمه",
      "وحمايه",
      "البيانات",
      "سجل"
    ],
    "href": "/admin/customers",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.09",
    "kind": "screen",
    "screenId": "09",
    "mapId": "screen.09",
    "labels": {
      "ar": "النشر متعدد القنوات والمحتوى"
    },
    "keywords": [
      "النشر",
      "متعدد",
      "القنوات",
      "والمحتوي",
      "منظومه",
      "والتواصل",
      "الخارجي",
      "التسويق"
    ],
    "href": "/admin/publish",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.10",
    "kind": "screen",
    "screenId": "10",
    "mapId": "screen.10",
    "labels": {
      "ar": "الحملات والتسويق والعمولات"
    },
    "keywords": [
      "الحملات",
      "والتسويق",
      "والعمولات",
      "والاعلانات",
      "والنمو",
      "التسويق"
    ],
    "href": "/admin/ads",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.11",
    "kind": "screen",
    "screenId": "11",
    "mapId": "screen.11",
    "labels": {
      "ar": "غرفة الوكلاء والمعرفة"
    },
    "keywords": [
      "غرفه",
      "الوكلاء",
      "والمعرفه",
      "الذكاء",
      "الاصطناعي",
      "والوكلاء"
    ],
    "href": "/admin/agent-war-room",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.12",
    "kind": "screen",
    "screenId": "12",
    "mapId": "screen.12",
    "labels": {
      "ar": "استوديو الأتمتة والتنفيذ"
    },
    "keywords": [
      "استوديو",
      "الاتمته",
      "والتنفيذ",
      "والنماذج",
      "الذكاء",
      "الاصطناعي"
    ],
    "href": "/admin/automation-studio",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.13",
    "kind": "screen",
    "screenId": "13",
    "mapId": "screen.13",
    "labels": {
      "ar": "المالية والفوترة والولاء"
    },
    "keywords": [
      "الماليه",
      "والفوتره",
      "والولاء",
      "والتجاره",
      "المعاملات"
    ],
    "href": "/admin/payments",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.14",
    "kind": "screen",
    "screenId": "14",
    "mapId": "screen.14",
    "labels": {
      "ar": "إعادة البيع وشبكة B2B"
    },
    "keywords": [
      "اعاده",
      "البيع",
      "وشبكه",
      "b2b",
      "منصه",
      "التوزيع",
      "والشركات",
      "التابعه",
      "الشركاء"
    ],
    "href": "/admin/resale",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.15",
    "kind": "screen",
    "screenId": "15",
    "mapId": "screen.15",
    "labels": {
      "ar": "الامتثال والخصوصية والصلاحيات"
    },
    "keywords": [
      "الامتثال",
      "والخصوصيه",
      "والصلاحيات",
      "القانوني",
      "والـ",
      "gdpr",
      "المركز"
    ],
    "href": "/admin/legal",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "domain.screen.16",
    "kind": "screen",
    "screenId": "16",
    "mapId": "screen.16",
    "labels": {
      "ar": "الإعدادات والتكاملات"
    },
    "keywords": [
      "الاعدادات",
      "والتكاملات",
      "اعدادات",
      "النظام",
      "والربط",
      "التقني",
      "التكاملات"
    ],
    "href": "/admin/settings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts"
  },
  {
    "id": "hub.agents.b2b",
    "kind": "domain_hub",
    "screenId": "11",
    "mapId": "hub.agents.b2b",
    "hubId": "agents.b2b",
    "labels": {
      "ar": "وكيل B2B"
    },
    "keywords": [
      "وكيل",
      "b2b",
      "صفحه",
      "الهبوط"
    ],
    "href": "/admin/b2b-landing-agent",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.11"
  },
  {
    "id": "hub.agents.builder",
    "kind": "domain_hub",
    "screenId": "11",
    "mapId": "hub.agents.builder",
    "hubId": "agents.builder",
    "labels": {
      "ar": "وكيل البناء"
    },
    "keywords": [
      "وكيل",
      "البناء",
      "المطور",
      "الذكي"
    ],
    "href": "/admin/builder-agent",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.11"
  },
  {
    "id": "hub.agents.memory",
    "kind": "domain_hub",
    "screenId": "11",
    "mapId": "hub.agents.memory",
    "hubId": "agents.memory",
    "labels": {
      "ar": "الدماغ الثاني"
    },
    "keywords": [
      "الدماغ",
      "الثاني",
      "ذاكره",
      "معرفه"
    ],
    "href": "/admin/agent-studio",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.11"
  },
  {
    "id": "hub.agents.models",
    "kind": "domain_hub",
    "screenId": "11",
    "mapId": "hub.agents.models",
    "hubId": "agents.models",
    "labels": {
      "ar": "نماذج الذكاء"
    },
    "keywords": [
      "نماذج",
      "الذكاء",
      "openrouter",
      "موديل"
    ],
    "href": "/admin/ai-settings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.11"
  },
  {
    "id": "hub.agents.programs",
    "kind": "domain_hub",
    "screenId": "11",
    "mapId": "hub.agents.programs",
    "hubId": "agents.programs",
    "labels": {
      "ar": "برامج الذكاء"
    },
    "keywords": [
      "برامج",
      "الذكاء",
      "مهارات"
    ],
    "href": "/admin/ai-programs",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.11"
  },
  {
    "id": "hub.agents.reviews",
    "kind": "domain_hub",
    "screenId": "11",
    "mapId": "hub.agents.reviews",
    "hubId": "agents.reviews",
    "labels": {
      "ar": "وكيل التقييمات"
    },
    "keywords": [
      "وكيل",
      "التقييمات"
    ],
    "href": "/admin/reviews",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.11"
  },
  {
    "id": "hub.agents.warroom",
    "kind": "domain_hub",
    "screenId": "11",
    "mapId": "hub.agents.warroom",
    "hubId": "agents.warroom",
    "labels": {
      "ar": "غرفة العمليات"
    },
    "keywords": [
      "غرفه",
      "العمليات",
      "war",
      "room",
      "خليه",
      "الوكلاء"
    ],
    "href": "/admin/agent-war-room",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.11"
  },
  {
    "id": "hub.auto.connections",
    "kind": "domain_hub",
    "screenId": "12",
    "mapId": "hub.auto.connections",
    "hubId": "auto.connections",
    "labels": {
      "ar": "الاتصالات"
    },
    "keywords": [
      "الاتصالات",
      "اتصالات",
      "الاتمته"
    ],
    "href": "/admin/integrations",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.12"
  },
  {
    "id": "hub.auto.jobs",
    "kind": "domain_hub",
    "screenId": "12",
    "mapId": "hub.auto.jobs",
    "hubId": "auto.jobs",
    "labels": {
      "ar": "المهام المجدولة"
    },
    "keywords": [
      "المهام",
      "المجدوله",
      "مهام",
      "مجدوله",
      "cron"
    ],
    "href": "/admin/automation",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.12"
  },
  {
    "id": "hub.auto.logs",
    "kind": "domain_hub",
    "screenId": "12",
    "mapId": "hub.auto.logs",
    "hubId": "auto.logs",
    "labels": {
      "ar": "سجل التنفيذ"
    },
    "keywords": [
      "سجل",
      "التنفيذ",
      "سجلات"
    ],
    "href": "/admin/automation",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.12"
  },
  {
    "id": "hub.auto.mcp",
    "kind": "domain_hub",
    "screenId": "12",
    "mapId": "hub.auto.mcp",
    "hubId": "auto.mcp",
    "labels": {
      "ar": "خوادم MCP"
    },
    "keywords": [
      "خوادم",
      "mcp",
      "ادوات"
    ],
    "href": "/admin/automation-studio",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.12"
  },
  {
    "id": "hub.auto.tools",
    "kind": "domain_hub",
    "screenId": "12",
    "mapId": "hub.auto.tools",
    "hubId": "auto.tools",
    "labels": {
      "ar": "أدوات لوحة التحكم"
    },
    "keywords": [
      "ادوات",
      "لوحه",
      "التحكم"
    ],
    "href": "/admin/automation-studio",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.12"
  },
  {
    "id": "hub.auto.voice",
    "kind": "domain_hub",
    "screenId": "12",
    "mapId": "hub.auto.voice",
    "hubId": "auto.voice",
    "labels": {
      "ar": "الصوت والإملاء"
    },
    "keywords": [
      "الصوت",
      "والاملاء",
      "صوت",
      "نطق"
    ],
    "href": "/admin/neural-studio",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.12"
  },
  {
    "id": "hub.b2b.companies",
    "kind": "domain_hub",
    "screenId": "14",
    "mapId": "hub.b2b.companies",
    "hubId": "b2b.companies",
    "labels": {
      "ar": "الشركات الشريكة"
    },
    "keywords": [
      "الشركات",
      "الشريكه",
      "شركات",
      "شريك",
      "موزع"
    ],
    "href": "/admin/resale/companies",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.14"
  },
  {
    "id": "hub.b2b.domains",
    "kind": "domain_hub",
    "screenId": "14",
    "mapId": "hub.b2b.domains",
    "hubId": "b2b.domains",
    "labels": {
      "ar": "النطاقات والخوادم"
    },
    "keywords": [
      "النطاقات",
      "والخوادم",
      "نطاق",
      "دومين",
      "خادم"
    ],
    "href": "/admin/resale/domains",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.14"
  },
  {
    "id": "hub.b2b.licenses",
    "kind": "domain_hub",
    "screenId": "14",
    "mapId": "hub.b2b.licenses",
    "hubId": "b2b.licenses",
    "labels": {
      "ar": "التراخيص والتحديثات"
    },
    "keywords": [
      "التراخيص",
      "والتحديثات",
      "ترخيص",
      "تراخيص",
      "تحديثات"
    ],
    "href": "/admin/resale/licenses",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.14"
  },
  {
    "id": "hub.b2b.scraper",
    "kind": "domain_hub",
    "screenId": "14",
    "mapId": "hub.b2b.scraper",
    "hubId": "b2b.scraper",
    "labels": {
      "ar": "رادار الشركات"
    },
    "keywords": [
      "رادار",
      "الشركات",
      "خرائط",
      "استخبارات"
    ],
    "href": "/admin/resale/scraper",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.14"
  },
  {
    "id": "hub.b2b.subscriptions",
    "kind": "domain_hub",
    "screenId": "14",
    "mapId": "hub.b2b.subscriptions",
    "hubId": "b2b.subscriptions",
    "labels": {
      "ar": "الاشتراكات والمحافظ"
    },
    "keywords": [
      "الاشتراكات",
      "والمحافظ",
      "اشتراك",
      "محافظ",
      "الشركاء"
    ],
    "href": "/admin/resale/subscriptions",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.14"
  },
  {
    "id": "hub.b2b.whitelabel",
    "kind": "domain_hub",
    "screenId": "14",
    "mapId": "hub.b2b.whitelabel",
    "hubId": "b2b.whitelabel",
    "labels": {
      "ar": "الوايت ليبل"
    },
    "keywords": [
      "الوايت",
      "ليبل",
      "وايت",
      "white",
      "label"
    ],
    "href": "/admin/resale/whitelabel",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.14"
  },
  {
    "id": "hub.bookings.b2b",
    "kind": "domain_hub",
    "screenId": "03",
    "mapId": "hub.bookings.b2b",
    "hubId": "bookings.b2b",
    "labels": {
      "ar": "حجوزات B2B"
    },
    "keywords": [
      "حجوزات",
      "b2b"
    ],
    "href": "/admin/resale/bookings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.03"
  },
  {
    "id": "hub.bookings.cancellations",
    "kind": "domain_hub",
    "screenId": "03",
    "mapId": "hub.bookings.cancellations",
    "hubId": "bookings.cancellations",
    "labels": {
      "ar": "طلبات الإلغاء"
    },
    "keywords": [
      "طلبات",
      "الالغاء",
      "الغاء",
      "استرداد"
    ],
    "href": "/admin/cancellations",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.03"
  },
  {
    "id": "hub.bookings.enquiries",
    "kind": "domain_hub",
    "screenId": "03",
    "mapId": "hub.bookings.enquiries",
    "hubId": "bookings.enquiries",
    "labels": {
      "ar": "طلبات الحجز"
    },
    "keywords": [
      "طلبات",
      "الحجز",
      "طلب",
      "حجز",
      "الحجوزات",
      "الجديده"
    ],
    "href": "/admin/bookings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.03"
  },
  {
    "id": "hub.bookings.hotel",
    "kind": "domain_hub",
    "screenId": "03",
    "mapId": "hub.bookings.hotel",
    "hubId": "bookings.hotel",
    "labels": {
      "ar": "حجوزات الفنادق"
    },
    "keywords": [
      "حجوزات",
      "الفنادق",
      "حجز",
      "فندقي"
    ],
    "href": "/admin/bookings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.03"
  },
  {
    "id": "hub.bookings.payments",
    "kind": "domain_hub",
    "screenId": "03",
    "mapId": "hub.bookings.payments",
    "hubId": "bookings.payments",
    "labels": {
      "ar": "مدفوعات الحجوزات"
    },
    "keywords": [
      "مدفوعات",
      "الحجوزات"
    ],
    "href": "/admin/payments",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.03"
  },
  {
    "id": "hub.bookings.reviews",
    "kind": "domain_hub",
    "screenId": "03",
    "mapId": "hub.bookings.reviews",
    "hubId": "bookings.reviews",
    "labels": {
      "ar": "التقييمات الموثقة"
    },
    "keywords": [
      "التقييمات",
      "الموثقه",
      "تقييمات",
      "موثقه",
      "تقييم",
      "العميل"
    ],
    "href": "/admin/reviews",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.03"
  },
  {
    "id": "hub.cms.blog",
    "kind": "domain_hub",
    "screenId": "07",
    "mapId": "hub.cms.blog",
    "hubId": "cms.blog",
    "labels": {
      "ar": "المدونة والمقالات"
    },
    "keywords": [
      "المدونه",
      "والمقالات",
      "مدونه",
      "مقال",
      "مقالات"
    ],
    "href": "/admin/blog",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.07"
  },
  {
    "id": "hub.cms.editor",
    "kind": "domain_hub",
    "screenId": "07",
    "mapId": "hub.cms.editor",
    "hubId": "cms.editor",
    "labels": {
      "ar": "المحرر المرئي"
    },
    "keywords": [
      "المحرر",
      "المرئي",
      "الصفحه",
      "الرئيسيه"
    ],
    "href": "/admin/homepage-editor",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.07"
  },
  {
    "id": "hub.cms.mobile",
    "kind": "domain_hub",
    "screenId": "07",
    "mapId": "hub.cms.mobile",
    "hubId": "cms.mobile",
    "labels": {
      "ar": "تطبيق الجوال"
    },
    "keywords": [
      "تطبيق",
      "الجوال",
      "الموبايل"
    ],
    "href": "/admin/mobile-app",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.07"
  },
  {
    "id": "hub.cms.pages",
    "kind": "domain_hub",
    "screenId": "07",
    "mapId": "hub.cms.pages",
    "hubId": "cms.pages",
    "labels": {
      "ar": "الصفحات"
    },
    "keywords": [
      "الصفحات",
      "صفحات",
      "صفحه"
    ],
    "href": "/admin/pages",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.07"
  },
  {
    "id": "hub.cms.pwa",
    "kind": "domain_hub",
    "screenId": "07",
    "mapId": "hub.cms.pwa",
    "hubId": "cms.pwa",
    "labels": {
      "ar": "تطبيق الويب PWA"
    },
    "keywords": [
      "تطبيق",
      "الويب",
      "pwa"
    ],
    "href": "/admin/pwa",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.07"
  },
  {
    "id": "hub.cms.search",
    "kind": "domain_hub",
    "screenId": "07",
    "mapId": "hub.cms.search",
    "hubId": "cms.search",
    "labels": {
      "ar": "تبويبات البحث"
    },
    "keywords": [
      "تبويبات",
      "البحث",
      "محرك"
    ],
    "href": "/admin/search-tabs",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.07"
  },
  {
    "id": "hub.cms.translations",
    "kind": "domain_hub",
    "screenId": "07",
    "mapId": "hub.cms.translations",
    "hubId": "cms.translations",
    "labels": {
      "ar": "الترجمات واللغات"
    },
    "keywords": [
      "الترجمات",
      "واللغات",
      "ترجمه",
      "لغات"
    ],
    "href": "/admin/translations",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.07"
  },
  {
    "id": "hub.cms.visibility",
    "kind": "domain_hub",
    "screenId": "07",
    "mapId": "hub.cms.visibility",
    "hubId": "cms.visibility",
    "labels": {
      "ar": "ظهور الأقسام"
    },
    "keywords": [
      "ظهور",
      "الاقسام",
      "اعدادات",
      "الموقع"
    ],
    "href": "/admin/content",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.07"
  },
  {
    "id": "hub.crm.channels",
    "kind": "domain_hub",
    "screenId": "08",
    "mapId": "hub.crm.channels",
    "hubId": "crm.channels",
    "labels": {
      "ar": "قنوات التواصل"
    },
    "keywords": [
      "قنوات",
      "التواصل",
      "واتساب",
      "دعم"
    ],
    "href": "/admin/contact-settings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.08"
  },
  {
    "id": "hub.crm.conversations",
    "kind": "domain_hub",
    "screenId": "08",
    "mapId": "hub.crm.conversations",
    "hubId": "crm.conversations",
    "labels": {
      "ar": "المحادثات الذكية"
    },
    "keywords": [
      "المحادثات",
      "الذكيه",
      "محادثات",
      "محادثه",
      "شات"
    ],
    "href": "/admin/customers",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.08"
  },
  {
    "id": "hub.crm.customers",
    "kind": "domain_hub",
    "screenId": "08",
    "mapId": "hub.crm.customers",
    "hubId": "crm.customers",
    "labels": {
      "ar": "العملاء والمسافرون"
    },
    "keywords": [
      "العملاء",
      "والمسافرون",
      "عميل",
      "عملاء",
      "مسافر"
    ],
    "href": "/admin/customers",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.08"
  },
  {
    "id": "hub.crm.deletions",
    "kind": "domain_hub",
    "screenId": "08",
    "mapId": "hub.crm.deletions",
    "hubId": "crm.deletions",
    "labels": {
      "ar": "طلبات حذف الحساب"
    },
    "keywords": [
      "طلبات",
      "حذف",
      "الحساب",
      "gdpr",
      "محو",
      "البيانات"
    ],
    "href": "/admin/legal?tab=deletions",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.08"
  },
  {
    "id": "hub.crm.leads",
    "kind": "domain_hub",
    "screenId": "08",
    "mapId": "hub.crm.leads",
    "hubId": "crm.leads",
    "labels": {
      "ar": "العملاء المحتملون"
    },
    "keywords": [
      "العملاء",
      "المحتملون",
      "عملاء",
      "محتملين",
      "leads"
    ],
    "href": "/admin/customers",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.08"
  },
  {
    "id": "hub.crm.notifications",
    "kind": "domain_hub",
    "screenId": "08",
    "mapId": "hub.crm.notifications",
    "hubId": "crm.notifications",
    "labels": {
      "ar": "الإشعارات"
    },
    "keywords": [
      "الاشعارات",
      "اشعارات",
      "تنبيهات"
    ],
    "href": "/admin",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.08"
  },
  {
    "id": "hub.crm.reviews",
    "kind": "domain_hub",
    "screenId": "08",
    "mapId": "hub.crm.reviews",
    "hubId": "crm.reviews",
    "labels": {
      "ar": "التقييمات الموثقة"
    },
    "keywords": [
      "التقييمات",
      "الموثقه",
      "تقييمات",
      "العملاء",
      "تقييم",
      "موثق"
    ],
    "href": "/admin/reviews",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.08"
  },
  {
    "id": "hub.fin.currencies",
    "kind": "domain_hub",
    "screenId": "13",
    "mapId": "hub.fin.currencies",
    "hubId": "fin.currencies",
    "labels": {
      "ar": "العملات والصرف"
    },
    "keywords": [
      "العملات",
      "والصرف",
      "عمله",
      "عملات",
      "صرف"
    ],
    "href": "/admin/currencies",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.13"
  },
  {
    "id": "hub.fin.gifts",
    "kind": "domain_hub",
    "screenId": "13",
    "mapId": "hub.fin.gifts",
    "hubId": "fin.gifts",
    "labels": {
      "ar": "بطاقات الهدايا"
    },
    "keywords": [
      "بطاقات",
      "الهدايا"
    ],
    "href": "/admin/gift-cards",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.13"
  },
  {
    "id": "hub.fin.invoices",
    "kind": "domain_hub",
    "screenId": "13",
    "mapId": "hub.fin.invoices",
    "hubId": "fin.invoices",
    "labels": {
      "ar": "الفواتير"
    },
    "keywords": [
      "الفواتير",
      "فاتوره",
      "فواتير",
      "parasut"
    ],
    "href": "/admin/invoices",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.13"
  },
  {
    "id": "hub.fin.loyalty",
    "kind": "domain_hub",
    "screenId": "13",
    "mapId": "hub.fin.loyalty",
    "hubId": "fin.loyalty",
    "labels": {
      "ar": "نقاط الولاء"
    },
    "keywords": [
      "نقاط",
      "الولاء",
      "مكافات"
    ],
    "href": "/admin/marketing/coupons",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.13"
  },
  {
    "id": "hub.fin.payments",
    "kind": "domain_hub",
    "screenId": "13",
    "mapId": "hub.fin.payments",
    "hubId": "fin.payments",
    "labels": {
      "ar": "بوابات الدفع"
    },
    "keywords": [
      "بوابات",
      "الدفع",
      "بوابه",
      "iyzico"
    ],
    "href": "/admin/payments",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.13"
  },
  {
    "id": "hub.fin.transactions",
    "kind": "domain_hub",
    "screenId": "13",
    "mapId": "hub.fin.transactions",
    "hubId": "fin.transactions",
    "labels": {
      "ar": "المعاملات"
    },
    "keywords": [
      "المعاملات",
      "معاملات",
      "مالي"
    ],
    "href": "/admin/payments",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.13"
  },
  {
    "id": "hub.fin.wallet",
    "kind": "domain_hub",
    "screenId": "13",
    "mapId": "hub.fin.wallet",
    "hubId": "fin.wallet",
    "labels": {
      "ar": "محفظة التوريد B2B"
    },
    "keywords": [
      "محفظه",
      "التوريد",
      "b2b",
      "ديبوزيت"
    ],
    "href": "/admin/b2b-wallet",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.13"
  },
  {
    "id": "hub.flights.airlines",
    "kind": "domain_hub",
    "screenId": "04",
    "mapId": "hub.flights.airlines",
    "hubId": "flights.airlines",
    "labels": {
      "ar": "شركات الطيران"
    },
    "keywords": [
      "شركات",
      "الطيران",
      "ناقل"
    ],
    "href": "/admin/flights",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.04"
  },
  {
    "id": "hub.flights.airports",
    "kind": "domain_hub",
    "screenId": "04",
    "mapId": "hub.flights.airports",
    "hubId": "flights.airports",
    "labels": {
      "ar": "المطارات والوجهات"
    },
    "keywords": [
      "المطارات",
      "والوجهات",
      "مطار",
      "مطارات"
    ],
    "href": "/admin/flights",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.04"
  },
  {
    "id": "hub.flights.extras",
    "kind": "domain_hub",
    "screenId": "04",
    "mapId": "hub.flights.extras",
    "hubId": "flights.extras",
    "labels": {
      "ar": "الخدمات الإضافية"
    },
    "keywords": [
      "الخدمات",
      "الاضافيه",
      "حقائب",
      "خدمات",
      "اضافيه",
      "مقاعد"
    ],
    "href": "/admin/flights",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.04"
  },
  {
    "id": "hub.flights.postops",
    "kind": "domain_hub",
    "screenId": "04",
    "mapId": "hub.flights.postops",
    "hubId": "flights.postops",
    "labels": {
      "ar": "عمليات ما بعد الحجز"
    },
    "keywords": [
      "عمليات",
      "ما",
      "بعد",
      "الحجز",
      "تعديل",
      "تذكره",
      "اصدار"
    ],
    "href": "/admin/flights",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.04"
  },
  {
    "id": "hub.flights.requests",
    "kind": "domain_hub",
    "screenId": "04",
    "mapId": "hub.flights.requests",
    "hubId": "flights.requests",
    "labels": {
      "ar": "طلبات الحجز الواردة"
    },
    "keywords": [
      "طلبات",
      "الحجز",
      "الوارده",
      "استفسار"
    ],
    "href": "/admin/bookings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.04"
  },
  {
    "id": "hub.flights.settings",
    "kind": "domain_hub",
    "screenId": "04",
    "mapId": "hub.flights.settings",
    "hubId": "flights.settings",
    "labels": {
      "ar": "إعدادات موزعي GDS"
    },
    "keywords": [
      "اعدادات",
      "موزعي",
      "gds",
      "موزع",
      "الطيران"
    ],
    "href": "/admin/flights",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.04"
  },
  {
    "id": "hub.growth.ads",
    "kind": "domain_hub",
    "screenId": "10",
    "mapId": "hub.growth.ads",
    "hubId": "growth.ads",
    "labels": {
      "ar": "الإعلانات الممولة"
    },
    "keywords": [
      "الاعلانات",
      "المموله",
      "اعلان",
      "اعلانات",
      "ميتا",
      "جوجل",
      "ادز"
    ],
    "href": "/admin/ads",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.10"
  },
  {
    "id": "hub.growth.affiliate",
    "kind": "domain_hub",
    "screenId": "10",
    "mapId": "hub.growth.affiliate",
    "hubId": "growth.affiliate",
    "labels": {
      "ar": "التسويق بالعمولة"
    },
    "keywords": [
      "التسويق",
      "بالعموله",
      "عموله",
      "افلييت",
      "مسوق"
    ],
    "href": "/admin/affiliate",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.10"
  },
  {
    "id": "hub.growth.coupons",
    "kind": "domain_hub",
    "screenId": "10",
    "mapId": "hub.growth.coupons",
    "hubId": "growth.coupons",
    "labels": {
      "ar": "الكوبونات والولاء"
    },
    "keywords": [
      "الكوبونات",
      "والولاء",
      "كوبون",
      "خصم",
      "قسيمه"
    ],
    "href": "/admin/marketing/coupons",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.10"
  },
  {
    "id": "hub.growth.email",
    "kind": "domain_hub",
    "screenId": "10",
    "mapId": "hub.growth.email",
    "hubId": "growth.email",
    "labels": {
      "ar": "التسويق بالبريد"
    },
    "keywords": [
      "التسويق",
      "بالبريد",
      "بريد",
      "نشره",
      "بريديه",
      "ايميل"
    ],
    "href": "/admin/email-marketing",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.10"
  },
  {
    "id": "hub.growth.gifts",
    "kind": "domain_hub",
    "screenId": "10",
    "mapId": "hub.growth.gifts",
    "hubId": "growth.gifts",
    "labels": {
      "ar": "بطاقات الهدايا"
    },
    "keywords": [
      "بطاقات",
      "الهدايا",
      "بطاقه",
      "هديه",
      "هدايا"
    ],
    "href": "/admin/gift-cards",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.10"
  },
  {
    "id": "hub.growth.recovery",
    "kind": "domain_hub",
    "screenId": "10",
    "mapId": "hub.growth.recovery",
    "hubId": "growth.recovery",
    "labels": {
      "ar": "استرجاع السلات"
    },
    "keywords": [
      "استرجاع",
      "السلات",
      "سلات",
      "متروكه"
    ],
    "href": "/admin/email-marketing",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.10"
  },
  {
    "id": "hub.hotels.bookings",
    "kind": "domain_hub",
    "screenId": "05",
    "mapId": "hub.hotels.bookings",
    "hubId": "hotels.bookings",
    "labels": {
      "ar": "حجوزات الفنادق"
    },
    "keywords": [
      "حجوزات",
      "الفنادق",
      "حجز",
      "فندق",
      "عرض",
      "سعر"
    ],
    "href": "/admin/bookings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.05"
  },
  {
    "id": "hub.hotels.catalog",
    "kind": "domain_hub",
    "screenId": "05",
    "mapId": "hub.hotels.catalog",
    "hubId": "hotels.catalog",
    "labels": {
      "ar": "الكتالوج الداخلي"
    },
    "keywords": [
      "الكتالوج",
      "الداخلي",
      "كتالوج",
      "غرف",
      "مرافق"
    ],
    "href": "/admin/hotels/catalog",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.05"
  },
  {
    "id": "hub.hotels.content",
    "kind": "domain_hub",
    "screenId": "05",
    "mapId": "hub.hotels.content",
    "hubId": "hotels.content",
    "labels": {
      "ar": "المميزة ومهام المحتوى"
    },
    "keywords": [
      "المميزه",
      "ومهام",
      "المحتوي",
      "فنادق",
      "مميزه",
      "مهام"
    ],
    "href": "/admin/hotels/featured",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.05"
  },
  {
    "id": "hub.hotels.destinations",
    "kind": "domain_hub",
    "screenId": "05",
    "mapId": "hub.hotels.destinations",
    "hubId": "hotels.destinations",
    "labels": {
      "ar": "الوجهات والمعالم"
    },
    "keywords": [
      "الوجهات",
      "والمعالم",
      "وجهه",
      "وجهات",
      "معالم"
    ],
    "href": "/admin/hotels/catalog",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.05"
  },
  {
    "id": "hub.hotels.owned",
    "kind": "domain_hub",
    "screenId": "05",
    "mapId": "hub.hotels.owned",
    "hubId": "hotels.owned",
    "labels": {
      "ar": "الفنادق المملوكة"
    },
    "keywords": [
      "الفنادق",
      "المملوكه",
      "فنادق",
      "مملوكه",
      "owned"
    ],
    "href": "/admin/hotels",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.05"
  },
  {
    "id": "hub.hotels.reviews",
    "kind": "domain_hub",
    "screenId": "05",
    "mapId": "hub.hotels.reviews",
    "hubId": "hotels.reviews",
    "labels": {
      "ar": "تقييمات الفنادق"
    },
    "keywords": [
      "تقييمات",
      "الفنادق",
      "تريب",
      "ادفايزر",
      "tripadvisor"
    ],
    "href": "/admin/reviews",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.05"
  },
  {
    "id": "hub.hotels.suppliers",
    "kind": "domain_hub",
    "screenId": "05",
    "mapId": "hub.hotels.suppliers",
    "hubId": "hotels.suppliers",
    "labels": {
      "ar": "مزودو ومارك أب الفنادق"
    },
    "keywords": [
      "مزودو",
      "ومارك",
      "اب",
      "الفنادق",
      "مزود",
      "مارك",
      "بنك",
      "اسره",
      "bedbank"
    ],
    "href": "/admin/hotels",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.05"
  },
  {
    "id": "hub.legal.access",
    "kind": "domain_hub",
    "screenId": "15",
    "mapId": "hub.legal.access",
    "hubId": "legal.access",
    "labels": {
      "ar": "الجلسات والصلاحيات"
    },
    "keywords": [
      "الجلسات",
      "والصلاحيات",
      "صلاحيات",
      "جلسه",
      "امان"
    ],
    "href": "/admin/pocketbase",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.15"
  },
  {
    "id": "hub.legal.clauses",
    "kind": "domain_hub",
    "screenId": "15",
    "mapId": "hub.legal.clauses",
    "hubId": "legal.clauses",
    "labels": {
      "ar": "الشروط والبنود"
    },
    "keywords": [
      "الشروط",
      "والبنود",
      "شروط",
      "بنود"
    ],
    "href": "/admin/legal?tab=terms",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.15"
  },
  {
    "id": "hub.legal.identity",
    "kind": "domain_hub",
    "screenId": "15",
    "mapId": "hub.legal.identity",
    "hubId": "legal.identity",
    "labels": {
      "ar": "هوية المنصة"
    },
    "keywords": [
      "هويه",
      "المنصه",
      "الاسم",
      "القانوني"
    ],
    "href": "/admin/legal?tab=identity",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.15"
  },
  {
    "id": "hub.legal.license",
    "kind": "domain_hub",
    "screenId": "15",
    "mapId": "hub.legal.license",
    "hubId": "legal.license",
    "labels": {
      "ar": "الترخيص والخطة"
    },
    "keywords": [
      "الترخيص",
      "والخطه",
      "ترخيص",
      "المنصه",
      "الخطه"
    ],
    "href": "/admin/license",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.15"
  },
  {
    "id": "hub.legal.privacy",
    "kind": "domain_hub",
    "screenId": "15",
    "mapId": "hub.legal.privacy",
    "hubId": "legal.privacy",
    "labels": {
      "ar": "الخصوصية وGDPR"
    },
    "keywords": [
      "الخصوصيه",
      "وgdpr",
      "خصوصيه",
      "gdpr"
    ],
    "href": "/admin/legal?tab=gdpr",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.15"
  },
  {
    "id": "hub.mobility.cars",
    "kind": "domain_hub",
    "screenId": "06",
    "mapId": "hub.mobility.cars",
    "hubId": "mobility.cars",
    "labels": {
      "ar": "تأجير السيارات"
    },
    "keywords": [
      "تاجير",
      "السيارات",
      "سياره",
      "سيارات"
    ],
    "href": "/admin/cars",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.06"
  },
  {
    "id": "hub.mobility.enquiries",
    "kind": "domain_hub",
    "screenId": "06",
    "mapId": "hub.mobility.enquiries",
    "hubId": "mobility.enquiries",
    "labels": {
      "ar": "طلبات الخدمات"
    },
    "keywords": [
      "طلبات",
      "الخدمات"
    ],
    "href": "/admin/bookings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.06"
  },
  {
    "id": "hub.mobility.packages",
    "kind": "domain_hub",
    "screenId": "06",
    "mapId": "hub.mobility.packages",
    "hubId": "mobility.packages",
    "labels": {
      "ar": "الباقات والعروض"
    },
    "keywords": [
      "الباقات",
      "والعروض",
      "باقه",
      "باقات",
      "عروض",
      "سياحيه"
    ],
    "href": "/admin/packages",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.06"
  },
  {
    "id": "hub.mobility.tours",
    "kind": "domain_hub",
    "screenId": "06",
    "mapId": "hub.mobility.tours",
    "hubId": "mobility.tours",
    "labels": {
      "ar": "الجولات اليومية"
    },
    "keywords": [
      "الجولات",
      "اليوميه",
      "جوله",
      "جولات"
    ],
    "href": "/admin/tours",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.06"
  },
  {
    "id": "hub.mobility.transfers",
    "kind": "domain_hub",
    "screenId": "06",
    "mapId": "hub.mobility.transfers",
    "hubId": "mobility.transfers",
    "labels": {
      "ar": "المواصلات والاستقبال"
    },
    "keywords": [
      "المواصلات",
      "والاستقبال",
      "ترانسفير",
      "استقبال",
      "مواصلات"
    ],
    "href": "/admin/transfers",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.06"
  },
  {
    "id": "hub.mobility.visa",
    "kind": "domain_hub",
    "screenId": "06",
    "mapId": "hub.mobility.visa",
    "hubId": "mobility.visa",
    "labels": {
      "ar": "خدمات التأشيرات"
    },
    "keywords": [
      "خدمات",
      "التاشيرات",
      "تاشيره",
      "فيزا"
    ],
    "href": "/admin/visa",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.06"
  },
  {
    "id": "hub.publish.accounts",
    "kind": "domain_hub",
    "screenId": "09",
    "mapId": "hub.publish.accounts",
    "hubId": "publish.accounts",
    "labels": {
      "ar": "الحسابات المرتبطة"
    },
    "keywords": [
      "الحسابات",
      "المرتبطه",
      "حسابات",
      "الربط",
      "oauth"
    ],
    "href": "/admin/social-accounts",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.09"
  },
  {
    "id": "hub.publish.agent",
    "kind": "domain_hub",
    "screenId": "09",
    "mapId": "hub.publish.agent",
    "hubId": "publish.agent",
    "labels": {
      "ar": "وكيل النشر"
    },
    "keywords": [
      "وكيل",
      "النشر"
    ],
    "href": "/admin/publish/agent",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.09"
  },
  {
    "id": "hub.publish.analytics",
    "kind": "domain_hub",
    "screenId": "09",
    "mapId": "hub.publish.analytics",
    "hubId": "publish.analytics",
    "labels": {
      "ar": "التحليلات والأداء"
    },
    "keywords": [
      "التحليلات",
      "والاداء",
      "تحليلات",
      "النشر",
      "تفاعل"
    ],
    "href": "/admin/publish/analytics",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.09"
  },
  {
    "id": "hub.publish.calendar",
    "kind": "domain_hub",
    "screenId": "09",
    "mapId": "hub.publish.calendar",
    "hubId": "publish.calendar",
    "labels": {
      "ar": "التقويم والجدولة"
    },
    "keywords": [
      "التقويم",
      "والجدوله",
      "جدوله",
      "تقويم",
      "النشر",
      "منشور"
    ],
    "href": "/admin/publish",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.09"
  },
  {
    "id": "hub.publish.compose",
    "kind": "domain_hub",
    "screenId": "09",
    "mapId": "hub.publish.compose",
    "hubId": "publish.compose",
    "labels": {
      "ar": "صانع المحتوى"
    },
    "keywords": [
      "صانع",
      "المحتوي",
      "ملحن"
    ],
    "href": "/admin/publish/compose",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.09"
  },
  {
    "id": "hub.publish.media",
    "kind": "domain_hub",
    "screenId": "09",
    "mapId": "hub.publish.media",
    "hubId": "publish.media",
    "labels": {
      "ar": "مكتبة الوسائط"
    },
    "keywords": [
      "مكتبه",
      "الوسائط",
      "فيديو"
    ],
    "href": "/admin/publish/media",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.09"
  },
  {
    "id": "hub.publish.rss",
    "kind": "domain_hub",
    "screenId": "09",
    "mapId": "hub.publish.rss",
    "hubId": "publish.rss",
    "labels": {
      "ar": "الأتمتة وRSS"
    },
    "keywords": [
      "الاتمته",
      "وrss",
      "rss",
      "خلاصات"
    ],
    "href": "/admin/publish/automations",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.09"
  },
  {
    "id": "hub.publish.settings",
    "kind": "domain_hub",
    "screenId": "09",
    "mapId": "hub.publish.settings",
    "hubId": "publish.settings",
    "labels": {
      "ar": "إعدادات القنوات"
    },
    "keywords": [
      "اعدادات",
      "القنوات",
      "النشر",
      "webhook"
    ],
    "href": "/admin/publish/settings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.09"
  },
  {
    "id": "hub.sys.database",
    "kind": "domain_hub",
    "screenId": "16",
    "mapId": "hub.sys.database",
    "hubId": "sys.database",
    "labels": {
      "ar": "قاعدة PocketBase"
    },
    "keywords": [
      "قاعده",
      "pocketbase",
      "البيانات"
    ],
    "href": "/admin/pocketbase",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.16"
  },
  {
    "id": "hub.sys.icons",
    "kind": "domain_hub",
    "screenId": "16",
    "mapId": "hub.sys.icons",
    "hubId": "sys.icons",
    "labels": {
      "ar": "الأيقونات والهوية"
    },
    "keywords": [
      "الايقونات",
      "والهويه",
      "ايقونات"
    ],
    "href": "/admin/icons",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.16"
  },
  {
    "id": "hub.sys.integrations",
    "kind": "domain_hub",
    "screenId": "16",
    "mapId": "hub.sys.integrations",
    "hubId": "sys.integrations",
    "labels": {
      "ar": "الربط وWebhooks"
    },
    "keywords": [
      "الربط",
      "وwebhooks",
      "تكامل",
      "webhooks",
      "ربط",
      "برمجي"
    ],
    "href": "/admin/integrations",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.16"
  },
  {
    "id": "hub.sys.media",
    "kind": "domain_hub",
    "screenId": "16",
    "mapId": "hub.sys.media",
    "hubId": "sys.media",
    "labels": {
      "ar": "مفاتيح الوسائط"
    },
    "keywords": [
      "مفاتيح",
      "الوسائط",
      "pexels",
      "unsplash"
    ],
    "href": "/admin/media",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.16"
  },
  {
    "id": "hub.sys.providers",
    "kind": "domain_hub",
    "screenId": "16",
    "mapId": "hub.sys.providers",
    "hubId": "sys.providers",
    "labels": {
      "ar": "مزودو البحث"
    },
    "keywords": [
      "مزودو",
      "البحث"
    ],
    "href": "/admin/providers",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.16"
  },
  {
    "id": "hub.sys.smtp",
    "kind": "domain_hub",
    "screenId": "16",
    "mapId": "hub.sys.smtp",
    "hubId": "sys.smtp",
    "labels": {
      "ar": "خادم البريد SMTP"
    },
    "keywords": [
      "خادم",
      "البريد",
      "smtp"
    ],
    "href": "/admin/email",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.16"
  },
  {
    "id": "hub.sys.translations",
    "kind": "domain_hub",
    "screenId": "16",
    "mapId": "hub.sys.translations",
    "hubId": "sys.translations",
    "labels": {
      "ar": "الترجمات"
    },
    "keywords": [
      "الترجمات",
      "ترجمات",
      "المنصه"
    ],
    "href": "/admin/translations",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "domain.screen.16"
  },
  {
    "id": "item.agents__b2b.api_admin_b2b_landing_agent",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.b2b",
    "hubId": "agents.b2b",
    "labels": {
      "ar": "وكيل صفحة الهبوط"
    },
    "keywords": [
      "وكيل",
      "صفحه",
      "الهبوط",
      "b2b",
      "/api/admin/b2b-landing-agent"
    ],
    "route": "/api/admin/b2b-landing-agent",
    "capabilityRefs": [
      "probe.b2b_landing_agent",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.b2b"
  },
  {
    "id": "item.agents__builder.api_admin_builder_agent",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.builder",
    "hubId": "agents.builder",
    "labels": {
      "ar": "وكيل البناء"
    },
    "keywords": [
      "وكيل",
      "البناء",
      "/api/admin/builder-agent"
    ],
    "route": "/api/admin/builder-agent",
    "capabilityRefs": [
      "probe.builder_agent",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.builder"
  },
  {
    "id": "item.agents__memory.api_admin_automation_agent_training",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.memory",
    "hubId": "agents.memory",
    "labels": {
      "ar": "تدريب الوكلاء"
    },
    "keywords": [
      "تدريب",
      "الوكلاء",
      "الدماغ",
      "الثاني",
      "/api/admin/automation/agent-training"
    ],
    "route": "/api/admin/automation/agent-training",
    "capabilityRefs": [
      "probe.automation_agent_training",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.memory"
  },
  {
    "id": "item.agents__memory.api_admin_automation_second_brain_data",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.memory",
    "hubId": "agents.memory",
    "labels": {
      "ar": "بيانات المعرفة"
    },
    "keywords": [
      "بيانات",
      "المعرفه",
      "الدماغ",
      "الثاني",
      "/api/admin/automation/second-brain-data"
    ],
    "route": "/api/admin/automation/second-brain-data",
    "capabilityRefs": [
      "probe.automation_second_brain_data",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.memory"
  },
  {
    "id": "item.agents__memory.api_admin_automation_second_brain_direct",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.memory",
    "hubId": "agents.memory",
    "labels": {
      "ar": "توجيهات المعرفة"
    },
    "keywords": [
      "توجيهات",
      "المعرفه",
      "الدماغ",
      "الثاني",
      "/api/admin/automation/second-brain-directive"
    ],
    "route": "/api/admin/automation/second-brain-directive",
    "capabilityRefs": [
      "probe.automation_second_brain_directive",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.memory"
  },
  {
    "id": "item.agents__models.api_admin_openrouter_config",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.models",
    "hubId": "agents.models",
    "labels": {
      "ar": "إعداد OpenRouter"
    },
    "keywords": [
      "اعداد",
      "openrouter",
      "نماذج",
      "الذكاء",
      "/api/admin/openrouter/config"
    ],
    "route": "/api/admin/openrouter/config",
    "capabilityRefs": [
      "probe.openrouter_config",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.models"
  },
  {
    "id": "item.agents__models.api_admin_openrouter_sync",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.models",
    "hubId": "agents.models",
    "labels": {
      "ar": "مزامنة النماذج"
    },
    "keywords": [
      "مزامنه",
      "النماذج",
      "نماذج",
      "الذكاء",
      "/api/admin/openrouter/sync"
    ],
    "route": "/api/admin/openrouter/sync",
    "capabilityRefs": [
      "probe.openrouter_sync",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.models"
  },
  {
    "id": "item.agents__programs.ai_conversations",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.programs",
    "hubId": "agents.programs",
    "labels": {
      "ar": "المحادثات"
    },
    "keywords": [
      "المحادثات",
      "برامج",
      "الذكاء",
      "ai_conversations"
    ],
    "collection": "ai_conversations",
    "capabilityRefs": [
      "collection.ai_conversations.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.programs"
  },
  {
    "id": "item.agents__programs.ai_programs",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.programs",
    "hubId": "agents.programs",
    "labels": {
      "ar": "البرامج"
    },
    "keywords": [
      "البرامج",
      "برامج",
      "الذكاء",
      "ai_programs"
    ],
    "collection": "ai_programs",
    "capabilityRefs": [
      "collection.ai_programs.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.programs"
  },
  {
    "id": "item.agents__reviews.api_admin_reviews_agent",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.reviews",
    "hubId": "agents.reviews",
    "labels": {
      "ar": "وكيل التقييمات"
    },
    "keywords": [
      "وكيل",
      "التقييمات",
      "/api/admin/reviews/agent"
    ],
    "route": "/api/admin/reviews/agent",
    "capabilityRefs": [
      "probe.reviews_agent",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.reviews"
  },
  {
    "id": "item.agents__warroom.api_admin_automation_agent_stream",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.warroom",
    "hubId": "agents.warroom",
    "labels": {
      "ar": "بث الوكلاء"
    },
    "keywords": [
      "بث",
      "الوكلاء",
      "غرفه",
      "العمليات",
      "/api/admin/automation/agent-stream"
    ],
    "route": "/api/admin/automation/agent-stream",
    "capabilityRefs": [
      "probe.automation_agent_stream",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.warroom"
  },
  {
    "id": "item.agents__warroom.api_admin_automation_agent_war_room",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.warroom",
    "hubId": "agents.warroom",
    "labels": {
      "ar": "غرفة العمليات"
    },
    "keywords": [
      "غرفه",
      "العمليات",
      "/api/admin/automation/agent-war-room"
    ],
    "route": "/api/admin/automation/agent-war-room",
    "capabilityRefs": [
      "probe.automation_agent_war_room",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.warroom"
  },
  {
    "id": "item.agents__warroom.api_admin_automation_swarm_deliberate",
    "kind": "domain_item",
    "screenId": "11",
    "mapId": "hub.agents.warroom",
    "hubId": "agents.warroom",
    "labels": {
      "ar": "التداول الجماعي"
    },
    "keywords": [
      "التداول",
      "الجماعي",
      "غرفه",
      "العمليات",
      "/api/admin/automation/swarm-deliberate"
    ],
    "route": "/api/admin/automation/swarm-deliberate",
    "capabilityRefs": [
      "probe.automation_swarm_deliberate",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.agents.warroom"
  },
  {
    "id": "item.auto__connections.api_admin_automation_comms_test",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.connections",
    "hubId": "auto.connections",
    "labels": {
      "ar": "اختبار القنوات"
    },
    "keywords": [
      "اختبار",
      "القنوات",
      "الاتصالات",
      "/api/admin/automation/comms/test"
    ],
    "route": "/api/admin/automation/comms/test",
    "capabilityRefs": [
      "probe.automation_comms_test",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.connections"
  },
  {
    "id": "item.auto__connections.api_admin_automation_connections",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.connections",
    "hubId": "auto.connections",
    "labels": {
      "ar": "الاتصالات"
    },
    "keywords": [
      "الاتصالات",
      "/api/admin/automation/connections"
    ],
    "route": "/api/admin/automation/connections",
    "capabilityRefs": [
      "probe.automation_connections",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.connections"
  },
  {
    "id": "item.auto__jobs.api_admin_automation_jobs",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.jobs",
    "hubId": "auto.jobs",
    "labels": {
      "ar": "المهام"
    },
    "keywords": [
      "المهام",
      "المجدوله",
      "/api/admin/automation/jobs"
    ],
    "route": "/api/admin/automation/jobs",
    "capabilityRefs": [
      "probe.automation_jobs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.jobs"
  },
  {
    "id": "item.auto__jobs.api_admin_automation_jobs_id_run",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.jobs",
    "hubId": "auto.jobs",
    "labels": {
      "ar": "تشغيل مهمة"
    },
    "keywords": [
      "تشغيل",
      "مهمه",
      "المهام",
      "المجدوله",
      "/api/admin/automation/jobs/[id]/run"
    ],
    "route": "/api/admin/automation/jobs/[id]/run",
    "capabilityRefs": [
      "probe.automation_jobs_id_run",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.jobs"
  },
  {
    "id": "item.auto__logs.api_admin_automation_logs",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.logs",
    "hubId": "auto.logs",
    "labels": {
      "ar": "سجلات الأتمتة"
    },
    "keywords": [
      "سجلات",
      "الاتمته",
      "سجل",
      "التنفيذ",
      "/api/admin/automation/logs"
    ],
    "route": "/api/admin/automation/logs",
    "capabilityRefs": [
      "probe.automation_logs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.logs"
  },
  {
    "id": "item.auto__logs.api_admin_automation_timeline_fallback",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.logs",
    "hubId": "auto.logs",
    "labels": {
      "ar": "الخط الزمني"
    },
    "keywords": [
      "الخط",
      "الزمني",
      "سجل",
      "التنفيذ",
      "/api/admin/automation/timeline-fallback"
    ],
    "route": "/api/admin/automation/timeline-fallback",
    "capabilityRefs": [
      "probe.automation_timeline_fallback",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.logs"
  },
  {
    "id": "item.auto__mcp.api_admin_mcp",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.mcp",
    "hubId": "auto.mcp",
    "labels": {
      "ar": "الخوادم"
    },
    "keywords": [
      "الخوادم",
      "خوادم",
      "mcp",
      "/api/admin/mcp"
    ],
    "route": "/api/admin/mcp",
    "capabilityRefs": [
      "probe.mcp",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.mcp"
  },
  {
    "id": "item.auto__mcp.api_admin_mcp_call",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.mcp",
    "hubId": "auto.mcp",
    "labels": {
      "ar": "استدعاء أداة"
    },
    "keywords": [
      "استدعاء",
      "اداه",
      "خوادم",
      "mcp",
      "/api/admin/mcp/call"
    ],
    "route": "/api/admin/mcp/call",
    "capabilityRefs": [
      "probe.mcp_call",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.mcp"
  },
  {
    "id": "item.auto__mcp.api_admin_mcp_connect",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.mcp",
    "hubId": "auto.mcp",
    "labels": {
      "ar": "ربط خادم"
    },
    "keywords": [
      "ربط",
      "خادم",
      "خوادم",
      "mcp",
      "/api/admin/mcp/connect"
    ],
    "route": "/api/admin/mcp/connect",
    "capabilityRefs": [
      "probe.mcp_connect",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.mcp"
  },
  {
    "id": "item.auto__tools.api_admin_automation_control_panel_tools",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.tools",
    "hubId": "auto.tools",
    "labels": {
      "ar": "أدوات التحكم"
    },
    "keywords": [
      "ادوات",
      "التحكم",
      "لوحه",
      "/api/admin/automation/control-panel-tools"
    ],
    "route": "/api/admin/automation/control-panel-tools",
    "capabilityRefs": [
      "probe.automation_control_panel_tools",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.tools"
  },
  {
    "id": "item.auto__tools.api_admin_automation_settings",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.tools",
    "hubId": "auto.tools",
    "labels": {
      "ar": "إعدادات الأتمتة"
    },
    "keywords": [
      "اعدادات",
      "الاتمته",
      "ادوات",
      "لوحه",
      "التحكم",
      "/api/admin/automation/settings"
    ],
    "route": "/api/admin/automation/settings",
    "capabilityRefs": [
      "probe.automation_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.tools"
  },
  {
    "id": "item.auto__voice.api_admin_automation_voice_tts",
    "kind": "domain_item",
    "screenId": "12",
    "mapId": "hub.auto.voice",
    "hubId": "auto.voice",
    "labels": {
      "ar": "توليد الصوت"
    },
    "keywords": [
      "توليد",
      "الصوت",
      "والاملاء",
      "/api/admin/automation/voice-tts"
    ],
    "route": "/api/admin/automation/voice-tts",
    "capabilityRefs": [
      "probe.automation_voice_tts",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.auto.voice"
  },
  {
    "id": "item.b2b__companies.reseller_companies",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.companies",
    "hubId": "b2b.companies",
    "labels": {
      "ar": "الشركات"
    },
    "keywords": [
      "الشركات",
      "الشريكه",
      "reseller_companies"
    ],
    "collection": "reseller_companies",
    "capabilityRefs": [
      "collection.reseller_companies.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.companies"
  },
  {
    "id": "item.b2b__companies.reseller_orders",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.companies",
    "hubId": "b2b.companies",
    "labels": {
      "ar": "الطلبات"
    },
    "keywords": [
      "الطلبات",
      "الشركات",
      "الشريكه",
      "reseller_orders"
    ],
    "collection": "reseller_orders",
    "capabilityRefs": [
      "collection.reseller_orders.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.companies"
  },
  {
    "id": "item.b2b__companies.reseller_progress",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.companies",
    "hubId": "b2b.companies",
    "labels": {
      "ar": "مراحل التسليم"
    },
    "keywords": [
      "مراحل",
      "التسليم",
      "الشركات",
      "الشريكه",
      "reseller_progress"
    ],
    "collection": "reseller_progress",
    "capabilityRefs": [
      "collection.reseller_progress.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.companies"
  },
  {
    "id": "item.b2b__domains.reseller_domain_events",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.domains",
    "hubId": "b2b.domains",
    "labels": {
      "ar": "أحداث النطاقات"
    },
    "keywords": [
      "احداث",
      "النطاقات",
      "والخوادم",
      "reseller_domain_events"
    ],
    "collection": "reseller_domain_events",
    "capabilityRefs": [
      "collection.reseller_domain_events.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.domains"
  },
  {
    "id": "item.b2b__domains.reseller_heartbeats",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.domains",
    "hubId": "b2b.domains",
    "labels": {
      "ar": "نبض الخوادم"
    },
    "keywords": [
      "نبض",
      "الخوادم",
      "النطاقات",
      "والخوادم",
      "reseller_heartbeats"
    ],
    "collection": "reseller_heartbeats",
    "capabilityRefs": [
      "collection.reseller_heartbeats.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.domains"
  },
  {
    "id": "item.b2b__domains.reseller_servers",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.domains",
    "hubId": "b2b.domains",
    "labels": {
      "ar": "الخوادم"
    },
    "keywords": [
      "الخوادم",
      "النطاقات",
      "والخوادم",
      "reseller_servers"
    ],
    "collection": "reseller_servers",
    "capabilityRefs": [
      "collection.reseller_servers.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.domains"
  },
  {
    "id": "item.b2b__licenses.reseller_licenses",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.licenses",
    "hubId": "b2b.licenses",
    "labels": {
      "ar": "التراخيص"
    },
    "keywords": [
      "التراخيص",
      "والتحديثات",
      "reseller_licenses"
    ],
    "collection": "reseller_licenses",
    "capabilityRefs": [
      "collection.reseller_licenses.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.licenses"
  },
  {
    "id": "item.b2b__licenses.reseller_settings",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.licenses",
    "hubId": "b2b.licenses",
    "labels": {
      "ar": "الإعدادات"
    },
    "keywords": [
      "الاعدادات",
      "التراخيص",
      "والتحديثات",
      "reseller_settings"
    ],
    "collection": "reseller_settings",
    "capabilityRefs": [
      "collection.reseller_settings.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.licenses"
  },
  {
    "id": "item.b2b__licenses.reseller_stage_templates",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.licenses",
    "hubId": "b2b.licenses",
    "labels": {
      "ar": "قوالب المراحل"
    },
    "keywords": [
      "قوالب",
      "المراحل",
      "التراخيص",
      "والتحديثات",
      "reseller_stage_templates"
    ],
    "collection": "reseller_stage_templates",
    "capabilityRefs": [
      "collection.reseller_stage_templates.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.licenses"
  },
  {
    "id": "item.b2b__scraper.api_admin_resale_scraper_campaigns",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.scraper",
    "hubId": "b2b.scraper",
    "labels": {
      "ar": "حملات الرادار"
    },
    "keywords": [
      "حملات",
      "الرادار",
      "رادار",
      "الشركات",
      "/api/admin/resale/scraper/campaigns"
    ],
    "route": "/api/admin/resale/scraper/campaigns",
    "capabilityRefs": [
      "probe.resale_scraper_campaigns",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.scraper"
  },
  {
    "id": "item.b2b__scraper.api_admin_resale_scraper_jobs",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.scraper",
    "hubId": "b2b.scraper",
    "labels": {
      "ar": "مهام الزحف"
    },
    "keywords": [
      "مهام",
      "الزحف",
      "رادار",
      "الشركات",
      "/api/admin/resale/scraper/jobs"
    ],
    "route": "/api/admin/resale/scraper/jobs",
    "capabilityRefs": [
      "probe.resale_scraper_jobs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.scraper"
  },
  {
    "id": "item.b2b__scraper.api_admin_resale_scraper_leads",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.scraper",
    "hubId": "b2b.scraper",
    "labels": {
      "ar": "العملاء المحتملون"
    },
    "keywords": [
      "العملاء",
      "المحتملون",
      "رادار",
      "الشركات",
      "/api/admin/resale/scraper/leads"
    ],
    "route": "/api/admin/resale/scraper/leads",
    "capabilityRefs": [
      "probe.resale_scraper_leads",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.scraper"
  },
  {
    "id": "item.b2b__subscriptions.api_admin_resale_b2b_bookings",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.subscriptions",
    "hubId": "b2b.subscriptions",
    "labels": {
      "ar": "حجوزات B2B"
    },
    "keywords": [
      "حجوزات",
      "b2b",
      "الاشتراكات",
      "والمحافظ",
      "/api/admin/resale/b2b-bookings"
    ],
    "route": "/api/admin/resale/b2b-bookings",
    "capabilityRefs": [
      "probe.resale_b2b_bookings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.subscriptions"
  },
  {
    "id": "item.b2b__subscriptions.api_admin_resale_wallets",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.subscriptions",
    "hubId": "b2b.subscriptions",
    "labels": {
      "ar": "المحافظ"
    },
    "keywords": [
      "المحافظ",
      "الاشتراكات",
      "والمحافظ",
      "/api/admin/resale/wallets"
    ],
    "route": "/api/admin/resale/wallets",
    "capabilityRefs": [
      "probe.resale_wallets",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.subscriptions"
  },
  {
    "id": "item.b2b__subscriptions.reseller_subscriptions",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.subscriptions",
    "hubId": "b2b.subscriptions",
    "labels": {
      "ar": "الاشتراكات"
    },
    "keywords": [
      "الاشتراكات",
      "والمحافظ",
      "reseller_subscriptions"
    ],
    "collection": "reseller_subscriptions",
    "capabilityRefs": [
      "collection.reseller_subscriptions.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.subscriptions"
  },
  {
    "id": "item.b2b__whitelabel.api_admin_resale_whitelabel",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.whitelabel",
    "hubId": "b2b.whitelabel",
    "labels": {
      "ar": "واجهة الوايت ليبل"
    },
    "keywords": [
      "واجهه",
      "الوايت",
      "ليبل",
      "/api/admin/resale/whitelabel"
    ],
    "route": "/api/admin/resale/whitelabel",
    "capabilityRefs": [
      "probe.resale_whitelabel",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.whitelabel"
  },
  {
    "id": "item.b2b__whitelabel.reseller_whitelabel_settings",
    "kind": "domain_item",
    "screenId": "14",
    "mapId": "hub.b2b.whitelabel",
    "hubId": "b2b.whitelabel",
    "labels": {
      "ar": "إعدادات الوايت ليبل"
    },
    "keywords": [
      "اعدادات",
      "الوايت",
      "ليبل",
      "reseller_whitelabel_settings"
    ],
    "collection": "reseller_whitelabel_settings",
    "capabilityRefs": [
      "collection.reseller_whitelabel_settings.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.b2b.whitelabel"
  },
  {
    "id": "item.bookings__b2b.api_admin_resale_b2b_bookings",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.b2b",
    "hubId": "bookings.b2b",
    "labels": {
      "ar": "واجهة B2B"
    },
    "keywords": [
      "واجهه",
      "b2b",
      "حجوزات",
      "/api/admin/resale/b2b-bookings"
    ],
    "route": "/api/admin/resale/b2b-bookings",
    "capabilityRefs": [
      "probe.resale_b2b_bookings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.b2b"
  },
  {
    "id": "item.bookings__b2b.reseller_orders",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.b2b",
    "hubId": "bookings.b2b",
    "labels": {
      "ar": "طلبات الموزعين"
    },
    "keywords": [
      "طلبات",
      "الموزعين",
      "حجوزات",
      "b2b",
      "reseller_orders"
    ],
    "collection": "reseller_orders",
    "capabilityRefs": [
      "collection.reseller_orders.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.b2b"
  },
  {
    "id": "item.bookings__cancellations.api_admin_cancellations",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.cancellations",
    "hubId": "bookings.cancellations",
    "labels": {
      "ar": "الطلبات المعلقة"
    },
    "keywords": [
      "الطلبات",
      "المعلقه",
      "طلبات",
      "الالغاء",
      "/api/admin/cancellations"
    ],
    "route": "/api/admin/cancellations",
    "capabilityRefs": [
      "probe.cancellations",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.cancellations"
  },
  {
    "id": "item.bookings__cancellations.hotel_bookings",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.cancellations",
    "hubId": "bookings.cancellations",
    "labels": {
      "ar": "الحجوزات"
    },
    "keywords": [
      "الحجوزات",
      "طلبات",
      "الالغاء",
      "hotel_bookings"
    ],
    "collection": "hotel_bookings",
    "capabilityRefs": [
      "collection.hotel_bookings.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.cancellations"
  },
  {
    "id": "item.bookings__enquiries.api_admin_new_bookings_count",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.enquiries",
    "hubId": "bookings.enquiries",
    "labels": {
      "ar": "عدّاد الجديدة"
    },
    "keywords": [
      "عداد",
      "الجديده",
      "طلبات",
      "الحجز",
      "/api/admin/new-bookings-count"
    ],
    "route": "/api/admin/new-bookings-count",
    "capabilityRefs": [
      "probe.new_bookings_count",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.enquiries"
  },
  {
    "id": "item.bookings__enquiries.enquiry_bookings",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.enquiries",
    "hubId": "bookings.enquiries",
    "labels": {
      "ar": "طلبات الاستفسار"
    },
    "keywords": [
      "طلبات",
      "الاستفسار",
      "الحجز",
      "enquiry_bookings"
    ],
    "collection": "enquiry_bookings",
    "capabilityRefs": [
      "collection.enquiry_bookings.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.enquiries"
  },
  {
    "id": "item.bookings__hotel.hotel_bookings",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.hotel",
    "hubId": "bookings.hotel",
    "labels": {
      "ar": "الحجوزات"
    },
    "keywords": [
      "الحجوزات",
      "حجوزات",
      "الفنادق",
      "hotel_bookings"
    ],
    "collection": "hotel_bookings",
    "capabilityRefs": [
      "collection.hotel_bookings.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.hotel"
  },
  {
    "id": "item.bookings__hotel.hotel_quotes",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.hotel",
    "hubId": "bookings.hotel",
    "labels": {
      "ar": "عروض الأسعار"
    },
    "keywords": [
      "عروض",
      "الاسعار",
      "حجوزات",
      "الفنادق",
      "hotel_quotes"
    ],
    "collection": "hotel_quotes",
    "capabilityRefs": [
      "collection.hotel_quotes.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.hotel"
  },
  {
    "id": "item.bookings__payments.api_admin_iyzico_bookings",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.payments",
    "hubId": "bookings.payments",
    "labels": {
      "ar": "حجوزات iyzico"
    },
    "keywords": [
      "حجوزات",
      "iyzico",
      "مدفوعات",
      "الحجوزات",
      "/api/admin/iyzico-bookings"
    ],
    "route": "/api/admin/iyzico-bookings",
    "capabilityRefs": [
      "probe.iyzico_bookings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.payments"
  },
  {
    "id": "item.bookings__payments.financial_transactions",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.payments",
    "hubId": "bookings.payments",
    "labels": {
      "ar": "المعاملات"
    },
    "keywords": [
      "المعاملات",
      "مدفوعات",
      "الحجوزات",
      "financial_transactions"
    ],
    "collection": "financial_transactions",
    "capabilityRefs": [
      "collection.financial_transactions.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.payments"
  },
  {
    "id": "item.bookings__reviews.customer_reviews",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.reviews",
    "hubId": "bookings.reviews",
    "labels": {
      "ar": "تقييمات العملاء"
    },
    "keywords": [
      "تقييمات",
      "العملاء",
      "التقييمات",
      "الموثقه",
      "customer_reviews"
    ],
    "collection": "customer_reviews",
    "capabilityRefs": [
      "collection.customer_reviews.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.reviews"
  },
  {
    "id": "item.bookings__reviews.hotel_guest_reviews",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.reviews",
    "hubId": "bookings.reviews",
    "labels": {
      "ar": "تقييمات النزلاء"
    },
    "keywords": [
      "تقييمات",
      "النزلاء",
      "التقييمات",
      "الموثقه",
      "hotel_guest_reviews"
    ],
    "collection": "hotel_guest_reviews",
    "capabilityRefs": [
      "collection.hotel_guest_reviews.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.reviews"
  },
  {
    "id": "item.bookings__reviews.hotel_review_scores",
    "kind": "domain_item",
    "screenId": "03",
    "mapId": "hub.bookings.reviews",
    "hubId": "bookings.reviews",
    "labels": {
      "ar": "درجات التقييم"
    },
    "keywords": [
      "درجات",
      "التقييم",
      "التقييمات",
      "الموثقه",
      "hotel_review_scores"
    ],
    "collection": "hotel_review_scores",
    "capabilityRefs": [
      "collection.hotel_review_scores.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.bookings.reviews"
  },
  {
    "id": "item.cms__blog.api_admin_blog",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.blog",
    "hubId": "cms.blog",
    "labels": {
      "ar": "واجهة المدونة"
    },
    "keywords": [
      "واجهه",
      "المدونه",
      "والمقالات",
      "/api/admin/blog"
    ],
    "route": "/api/admin/blog",
    "capabilityRefs": [
      "probe.blog",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.blog"
  },
  {
    "id": "item.cms__blog.articles",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.blog",
    "hubId": "cms.blog",
    "labels": {
      "ar": "المقالات"
    },
    "keywords": [
      "المقالات",
      "المدونه",
      "والمقالات",
      "articles"
    ],
    "collection": "articles",
    "capabilityRefs": [
      "collection.articles.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.blog"
  },
  {
    "id": "item.cms__editor.api_admin_branding",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.editor",
    "hubId": "cms.editor",
    "labels": {
      "ar": "الهوية البصرية"
    },
    "keywords": [
      "الهويه",
      "البصريه",
      "المحرر",
      "المرئي",
      "/api/admin/branding"
    ],
    "href": "/admin/branding",
    "route": "/api/admin/branding",
    "capabilityRefs": [
      "probe.branding",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.editor"
  },
  {
    "id": "item.cms__editor.api_admin_homepage_template",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.editor",
    "hubId": "cms.editor",
    "labels": {
      "ar": "قالب الرئيسية"
    },
    "keywords": [
      "قالب",
      "الرئيسيه",
      "المحرر",
      "المرئي",
      "/api/admin/homepage-template"
    ],
    "route": "/api/admin/homepage-template",
    "capabilityRefs": [
      "probe.homepage_template",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.editor"
  },
  {
    "id": "item.cms__editor.api_admin_theme",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.editor",
    "hubId": "cms.editor",
    "labels": {
      "ar": "السمة"
    },
    "keywords": [
      "السمه",
      "المحرر",
      "المرئي",
      "/api/admin/theme"
    ],
    "route": "/api/admin/theme",
    "capabilityRefs": [
      "probe.theme",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.editor"
  },
  {
    "id": "item.cms__mobile.api_admin_mobile_app_agents",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.mobile",
    "hubId": "cms.mobile",
    "labels": {
      "ar": "وكلاء التطبيق"
    },
    "keywords": [
      "وكلاء",
      "التطبيق",
      "تطبيق",
      "الجوال",
      "/api/admin/mobile-app/agents"
    ],
    "route": "/api/admin/mobile-app/agents",
    "capabilityRefs": [
      "probe.mobile_app_agents",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.mobile"
  },
  {
    "id": "item.cms__mobile.api_admin_mobile_app_build",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.mobile",
    "hubId": "cms.mobile",
    "labels": {
      "ar": "بناء التطبيق"
    },
    "keywords": [
      "بناء",
      "التطبيق",
      "تطبيق",
      "الجوال",
      "/api/admin/mobile-app/build"
    ],
    "route": "/api/admin/mobile-app/build",
    "capabilityRefs": [
      "probe.mobile_app_build",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.mobile"
  },
  {
    "id": "item.cms__mobile.api_admin_mobile_app_notifications",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.mobile",
    "hubId": "cms.mobile",
    "labels": {
      "ar": "إشعارات التطبيق"
    },
    "keywords": [
      "اشعارات",
      "التطبيق",
      "تطبيق",
      "الجوال",
      "/api/admin/mobile-app/notifications"
    ],
    "route": "/api/admin/mobile-app/notifications",
    "capabilityRefs": [
      "probe.mobile_app_notifications",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.mobile"
  },
  {
    "id": "item.cms__pages.api_admin_builder_pages",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.pages",
    "hubId": "cms.pages",
    "labels": {
      "ar": "صفحات البنّاء"
    },
    "keywords": [
      "صفحات",
      "البناء",
      "الصفحات",
      "/api/admin/builder-pages"
    ],
    "route": "/api/admin/builder-pages",
    "capabilityRefs": [
      "probe.builder_pages",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.pages"
  },
  {
    "id": "item.cms__pages.api_admin_pages",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.pages",
    "hubId": "cms.pages",
    "labels": {
      "ar": "الصفحات الثابتة"
    },
    "keywords": [
      "الصفحات",
      "الثابته",
      "/api/admin/pages"
    ],
    "route": "/api/admin/pages",
    "capabilityRefs": [
      "probe.pages",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.pages"
  },
  {
    "id": "item.cms__pwa.api_admin_push_subscribe",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.pwa",
    "hubId": "cms.pwa",
    "labels": {
      "ar": "اشتراكات الإشعارات"
    },
    "keywords": [
      "اشتراكات",
      "الاشعارات",
      "تطبيق",
      "الويب",
      "pwa",
      "/api/admin/push/subscribe"
    ],
    "route": "/api/admin/push/subscribe",
    "capabilityRefs": [
      "probe.push_subscribe",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.pwa"
  },
  {
    "id": "item.cms__pwa.api_admin_pwa",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.pwa",
    "hubId": "cms.pwa",
    "labels": {
      "ar": "إعدادات PWA"
    },
    "keywords": [
      "اعدادات",
      "pwa",
      "تطبيق",
      "الويب",
      "/api/admin/pwa"
    ],
    "route": "/api/admin/pwa",
    "capabilityRefs": [
      "probe.pwa",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.pwa"
  },
  {
    "id": "item.cms__pwa.api_admin_pwa_icon",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.pwa",
    "hubId": "cms.pwa",
    "labels": {
      "ar": "أيقونة التطبيق"
    },
    "keywords": [
      "ايقونه",
      "التطبيق",
      "تطبيق",
      "الويب",
      "pwa",
      "/api/admin/pwa/icon"
    ],
    "route": "/api/admin/pwa/icon",
    "capabilityRefs": [
      "probe.pwa_icon",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.pwa"
  },
  {
    "id": "item.cms__search.api_admin_search_tabs",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.search",
    "hubId": "cms.search",
    "labels": {
      "ar": "تبويبات البحث"
    },
    "keywords": [
      "تبويبات",
      "البحث",
      "/api/admin/search-tabs"
    ],
    "route": "/api/admin/search-tabs",
    "capabilityRefs": [
      "probe.search_tabs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.search"
  },
  {
    "id": "item.cms__translations.api_admin_translations",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.translations",
    "hubId": "cms.translations",
    "labels": {
      "ar": "الترجمات"
    },
    "keywords": [
      "الترجمات",
      "واللغات",
      "/api/admin/translations"
    ],
    "route": "/api/admin/translations",
    "capabilityRefs": [
      "probe.translations",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.translations"
  },
  {
    "id": "item.cms__translations.api_admin_translations_languages",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.translations",
    "hubId": "cms.translations",
    "labels": {
      "ar": "اللغات"
    },
    "keywords": [
      "اللغات",
      "الترجمات",
      "واللغات",
      "/api/admin/translations/languages"
    ],
    "route": "/api/admin/translations/languages",
    "capabilityRefs": [
      "probe.translations_languages",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.translations"
  },
  {
    "id": "item.cms__visibility.site_settings",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.visibility",
    "hubId": "cms.visibility",
    "labels": {
      "ar": "إعدادات الموقع"
    },
    "keywords": [
      "اعدادات",
      "الموقع",
      "ظهور",
      "الاقسام",
      "site_settings"
    ],
    "collection": "site_settings",
    "capabilityRefs": [
      "collection.site_settings.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.visibility"
  },
  {
    "id": "item.cms__visibility.site_traffic_logs",
    "kind": "domain_item",
    "screenId": "07",
    "mapId": "hub.cms.visibility",
    "hubId": "cms.visibility",
    "labels": {
      "ar": "سجل الزيارات"
    },
    "keywords": [
      "سجل",
      "الزيارات",
      "ظهور",
      "الاقسام",
      "site_traffic_logs"
    ],
    "collection": "site_traffic_logs",
    "capabilityRefs": [
      "collection.site_traffic_logs.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.cms.visibility"
  },
  {
    "id": "item.crm__channels.api_admin_automation_comms",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.channels",
    "hubId": "crm.channels",
    "labels": {
      "ar": "قنوات المراسلة"
    },
    "keywords": [
      "قنوات",
      "المراسله",
      "التواصل",
      "/api/admin/automation/comms"
    ],
    "route": "/api/admin/automation/comms",
    "capabilityRefs": [
      "probe.automation_comms",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.channels"
  },
  {
    "id": "item.crm__channels.api_admin_automation_whatsapp_qr",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.channels",
    "hubId": "crm.channels",
    "labels": {
      "ar": "ربط واتساب"
    },
    "keywords": [
      "ربط",
      "واتساب",
      "قنوات",
      "التواصل",
      "/api/admin/automation/whatsapp-qr"
    ],
    "route": "/api/admin/automation/whatsapp-qr",
    "capabilityRefs": [
      "probe.automation_whatsapp_qr",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.channels"
  },
  {
    "id": "item.crm__channels.api_admin_site_contact",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.channels",
    "hubId": "crm.channels",
    "labels": {
      "ar": "بيانات التواصل"
    },
    "keywords": [
      "بيانات",
      "التواصل",
      "قنوات",
      "/api/admin/site-contact"
    ],
    "route": "/api/admin/site-contact",
    "capabilityRefs": [
      "probe.site_contact",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.channels"
  },
  {
    "id": "item.crm__conversations.ai_conversations",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.conversations",
    "hubId": "crm.conversations",
    "labels": {
      "ar": "محادثات الذكاء الاصطناعي"
    },
    "keywords": [
      "محادثات",
      "الذكاء",
      "الاصطناعي",
      "المحادثات",
      "الذكيه",
      "ai_conversations"
    ],
    "collection": "ai_conversations",
    "capabilityRefs": [
      "collection.ai_conversations.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.conversations"
  },
  {
    "id": "item.crm__conversations.api_admin_automation_messages",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.conversations",
    "hubId": "crm.conversations",
    "labels": {
      "ar": "رسائل الأتمتة"
    },
    "keywords": [
      "رسائل",
      "الاتمته",
      "المحادثات",
      "الذكيه",
      "/api/admin/automation/messages"
    ],
    "route": "/api/admin/automation/messages",
    "capabilityRefs": [
      "probe.automation_messages",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.conversations"
  },
  {
    "id": "item.crm__customers.customers",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.customers",
    "hubId": "crm.customers",
    "labels": {
      "ar": "العملاء"
    },
    "keywords": [
      "العملاء",
      "والمسافرون",
      "customers"
    ],
    "collection": "customers",
    "capabilityRefs": [
      "collection.customers.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.customers"
  },
  {
    "id": "item.crm__customers.users",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.customers",
    "hubId": "crm.customers",
    "labels": {
      "ar": "حسابات المستخدمين"
    },
    "keywords": [
      "حسابات",
      "المستخدمين",
      "العملاء",
      "والمسافرون",
      "users"
    ],
    "collection": "users",
    "capabilityRefs": [
      "collection.users.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.customers"
  },
  {
    "id": "item.crm__deletions.api_admin_legal_deletions",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.deletions",
    "hubId": "crm.deletions",
    "labels": {
      "ar": "طلبات الحذف"
    },
    "keywords": [
      "طلبات",
      "الحذف",
      "حذف",
      "الحساب",
      "/api/admin/legal/deletions"
    ],
    "route": "/api/admin/legal/deletions",
    "capabilityRefs": [
      "probe.legal_deletions",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.deletions"
  },
  {
    "id": "item.crm__leads.api_admin_crm_leads",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.leads",
    "hubId": "crm.leads",
    "labels": {
      "ar": "واجهة CRM"
    },
    "keywords": [
      "واجهه",
      "crm",
      "العملاء",
      "المحتملون",
      "/api/admin/crm/leads"
    ],
    "route": "/api/admin/crm/leads",
    "capabilityRefs": [
      "probe.crm_leads",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.leads"
  },
  {
    "id": "item.crm__leads.crm_leads",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.leads",
    "hubId": "crm.leads",
    "labels": {
      "ar": "العملاء المحتملون"
    },
    "keywords": [
      "العملاء",
      "المحتملون",
      "crm_leads"
    ],
    "collection": "crm_leads",
    "capabilityRefs": [
      "collection.crm_leads.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.leads"
  },
  {
    "id": "item.crm__notifications.admin_notifications",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.notifications",
    "hubId": "crm.notifications",
    "labels": {
      "ar": "إشعارات الإدارة"
    },
    "keywords": [
      "اشعارات",
      "الاداره",
      "الاشعارات",
      "admin_notifications"
    ],
    "collection": "admin_notifications",
    "capabilityRefs": [
      "collection.admin_notifications.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.notifications"
  },
  {
    "id": "item.crm__notifications.api_admin_notifications",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.notifications",
    "hubId": "crm.notifications",
    "labels": {
      "ar": "واجهة الإشعارات"
    },
    "keywords": [
      "واجهه",
      "الاشعارات",
      "/api/admin/notifications"
    ],
    "route": "/api/admin/notifications",
    "capabilityRefs": [
      "probe.notifications",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.notifications"
  },
  {
    "id": "item.crm__reviews.customer_reviews",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.reviews",
    "hubId": "crm.reviews",
    "labels": {
      "ar": "تقييمات العملاء"
    },
    "keywords": [
      "تقييمات",
      "العملاء",
      "التقييمات",
      "الموثقه",
      "customer_reviews"
    ],
    "collection": "customer_reviews",
    "capabilityRefs": [
      "collection.customer_reviews.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.reviews"
  },
  {
    "id": "item.crm__reviews.hotel_guest_reviews",
    "kind": "domain_item",
    "screenId": "08",
    "mapId": "hub.crm.reviews",
    "hubId": "crm.reviews",
    "labels": {
      "ar": "تقييمات النزلاء"
    },
    "keywords": [
      "تقييمات",
      "النزلاء",
      "التقييمات",
      "الموثقه",
      "hotel_guest_reviews"
    ],
    "collection": "hotel_guest_reviews",
    "capabilityRefs": [
      "collection.hotel_guest_reviews.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.crm.reviews"
  },
  {
    "id": "item.fin__currencies.api_admin_currencies",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.currencies",
    "hubId": "fin.currencies",
    "labels": {
      "ar": "العملات"
    },
    "keywords": [
      "العملات",
      "والصرف",
      "/api/admin/currencies"
    ],
    "route": "/api/admin/currencies",
    "capabilityRefs": [
      "probe.currencies",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.currencies"
  },
  {
    "id": "item.fin__gifts.api_admin_gift_cards",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.gifts",
    "hubId": "fin.gifts",
    "labels": {
      "ar": "بطاقات الهدايا"
    },
    "keywords": [
      "بطاقات",
      "الهدايا",
      "/api/admin/gift-cards"
    ],
    "route": "/api/admin/gift-cards",
    "capabilityRefs": [
      "probe.gift_cards",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.gifts"
  },
  {
    "id": "item.fin__invoices.api_admin_invoice_templates",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.invoices",
    "hubId": "fin.invoices",
    "labels": {
      "ar": "قوالب الفواتير"
    },
    "keywords": [
      "قوالب",
      "الفواتير",
      "/api/admin/invoice-templates"
    ],
    "route": "/api/admin/invoice-templates",
    "capabilityRefs": [
      "probe.invoice_templates",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.invoices"
  },
  {
    "id": "item.fin__invoices.api_admin_parasut_invoices",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.invoices",
    "hubId": "fin.invoices",
    "labels": {
      "ar": "فواتير Paraşüt"
    },
    "keywords": [
      "فواتير",
      "paraşüt",
      "الفواتير",
      "/api/admin/parasut/invoices"
    ],
    "route": "/api/admin/parasut/invoices",
    "capabilityRefs": [
      "probe.parasut_invoices",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.invoices"
  },
  {
    "id": "item.fin__invoices.api_admin_parasut_issue",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.invoices",
    "hubId": "fin.invoices",
    "labels": {
      "ar": "إصدار فاتورة"
    },
    "keywords": [
      "اصدار",
      "فاتوره",
      "الفواتير",
      "/api/admin/parasut/issue"
    ],
    "route": "/api/admin/parasut/issue",
    "capabilityRefs": [
      "probe.parasut_issue",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.invoices"
  },
  {
    "id": "item.fin__loyalty.api_admin_loyalty",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.loyalty",
    "hubId": "fin.loyalty",
    "labels": {
      "ar": "واجهة الولاء"
    },
    "keywords": [
      "واجهه",
      "الولاء",
      "نقاط",
      "/api/admin/loyalty"
    ],
    "route": "/api/admin/loyalty",
    "capabilityRefs": [
      "probe.loyalty",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.loyalty"
  },
  {
    "id": "item.fin__loyalty.loyalty_wallets",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.loyalty",
    "hubId": "fin.loyalty",
    "labels": {
      "ar": "محافظ الولاء"
    },
    "keywords": [
      "محافظ",
      "الولاء",
      "نقاط",
      "loyalty_wallets"
    ],
    "collection": "loyalty_wallets",
    "capabilityRefs": [
      "collection.loyalty_wallets.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.loyalty"
  },
  {
    "id": "item.fin__payments.api_admin_iyzico_bookings",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.payments",
    "hubId": "fin.payments",
    "labels": {
      "ar": "حجوزات iyzico"
    },
    "keywords": [
      "حجوزات",
      "iyzico",
      "بوابات",
      "الدفع",
      "/api/admin/iyzico-bookings"
    ],
    "route": "/api/admin/iyzico-bookings",
    "capabilityRefs": [
      "probe.iyzico_bookings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.payments"
  },
  {
    "id": "item.fin__payments.api_admin_payments_catalog",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.payments",
    "hubId": "fin.payments",
    "labels": {
      "ar": "كتالوج البوابات"
    },
    "keywords": [
      "كتالوج",
      "البوابات",
      "بوابات",
      "الدفع",
      "/api/admin/payments/catalog"
    ],
    "route": "/api/admin/payments/catalog",
    "capabilityRefs": [
      "probe.payments_catalog",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.payments"
  },
  {
    "id": "item.fin__payments.api_admin_payments_configs",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.payments",
    "hubId": "fin.payments",
    "labels": {
      "ar": "إعدادات البوابات"
    },
    "keywords": [
      "اعدادات",
      "البوابات",
      "بوابات",
      "الدفع",
      "/api/admin/payments/configs"
    ],
    "route": "/api/admin/payments/configs",
    "capabilityRefs": [
      "probe.payments_configs",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.payments"
  },
  {
    "id": "item.fin__transactions.api_admin_finance_overview",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.transactions",
    "hubId": "fin.transactions",
    "labels": {
      "ar": "النظرة المالية"
    },
    "keywords": [
      "النظره",
      "الماليه",
      "المعاملات",
      "/api/admin/finance/overview"
    ],
    "route": "/api/admin/finance/overview",
    "capabilityRefs": [
      "probe.finance_overview",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.transactions"
  },
  {
    "id": "item.fin__transactions.financial_transactions",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.transactions",
    "hubId": "fin.transactions",
    "labels": {
      "ar": "المعاملات المالية"
    },
    "keywords": [
      "المعاملات",
      "الماليه",
      "financial_transactions"
    ],
    "collection": "financial_transactions",
    "capabilityRefs": [
      "collection.financial_transactions.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.transactions"
  },
  {
    "id": "item.fin__wallet.api_admin_b2b_wallet",
    "kind": "domain_item",
    "screenId": "13",
    "mapId": "hub.fin.wallet",
    "hubId": "fin.wallet",
    "labels": {
      "ar": "المحفظة"
    },
    "keywords": [
      "المحفظه",
      "محفظه",
      "التوريد",
      "b2b",
      "/api/admin/b2b-wallet"
    ],
    "route": "/api/admin/b2b-wallet",
    "capabilityRefs": [
      "probe.b2b_wallet",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.fin.wallet"
  },
  {
    "id": "item.flights__airlines.api_admin_airlines",
    "kind": "domain_item",
    "screenId": "04",
    "mapId": "hub.flights.airlines",
    "hubId": "flights.airlines",
    "labels": {
      "ar": "سجل الناقلين"
    },
    "keywords": [
      "سجل",
      "الناقلين",
      "شركات",
      "الطيران",
      "/api/admin/airlines"
    ],
    "route": "/api/admin/airlines",
    "capabilityRefs": [
      "probe.airlines",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.flights.airlines"
  },
  {
    "id": "item.flights__airports.api_admin_airports",
    "kind": "domain_item",
    "screenId": "04",
    "mapId": "hub.flights.airports",
    "hubId": "flights.airports",
    "labels": {
      "ar": "المطارات"
    },
    "keywords": [
      "المطارات",
      "والوجهات",
      "/api/admin/airports"
    ],
    "route": "/api/admin/airports",
    "capabilityRefs": [
      "probe.airports",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.flights.airports"
  },
  {
    "id": "item.flights__airports.geo_places",
    "kind": "domain_item",
    "screenId": "04",
    "mapId": "hub.flights.airports",
    "hubId": "flights.airports",
    "labels": {
      "ar": "الأماكن الجغرافية"
    },
    "keywords": [
      "الاماكن",
      "الجغرافيه",
      "المطارات",
      "والوجهات",
      "geo_places"
    ],
    "collection": "geo_places",
    "capabilityRefs": [
      "collection.geo_places.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.flights.airports"
  },
  {
    "id": "item.flights__extras.api_admin_flight_extras",
    "kind": "domain_item",
    "screenId": "04",
    "mapId": "hub.flights.extras",
    "hubId": "flights.extras",
    "labels": {
      "ar": "إضافات الرحلة"
    },
    "keywords": [
      "اضافات",
      "الرحله",
      "الخدمات",
      "الاضافيه",
      "/api/admin/flight-extras"
    ],
    "route": "/api/admin/flight-extras",
    "capabilityRefs": [
      "probe.flight_extras",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.flights.extras"
  },
  {
    "id": "item.flights__postops.api_admin_cancellations",
    "kind": "domain_item",
    "screenId": "04",
    "mapId": "hub.flights.postops",
    "hubId": "flights.postops",
    "labels": {
      "ar": "طلبات الإلغاء"
    },
    "keywords": [
      "طلبات",
      "الالغاء",
      "عمليات",
      "ما",
      "بعد",
      "الحجز",
      "/api/admin/cancellations"
    ],
    "href": "/admin/cancellations",
    "route": "/api/admin/cancellations",
    "capabilityRefs": [
      "probe.cancellations",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.flights.postops"
  },
  {
    "id": "item.flights__postops.api_admin_flights_post_ops",
    "kind": "domain_item",
    "screenId": "04",
    "mapId": "hub.flights.postops",
    "hubId": "flights.postops",
    "labels": {
      "ar": "عمليات ما بعد الإصدار"
    },
    "keywords": [
      "عمليات",
      "ما",
      "بعد",
      "الاصدار",
      "الحجز",
      "/api/admin/flights/post-ops"
    ],
    "route": "/api/admin/flights/post-ops",
    "capabilityRefs": [
      "probe.flights_post_ops",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.flights.postops"
  },
  {
    "id": "item.flights__requests.api_admin_new_bookings_count",
    "kind": "domain_item",
    "screenId": "04",
    "mapId": "hub.flights.requests",
    "hubId": "flights.requests",
    "labels": {
      "ar": "عدّاد الحجوزات الجديدة"
    },
    "keywords": [
      "عداد",
      "الحجوزات",
      "الجديده",
      "طلبات",
      "الحجز",
      "الوارده",
      "/api/admin/new-bookings-count"
    ],
    "route": "/api/admin/new-bookings-count",
    "capabilityRefs": [
      "probe.new_bookings_count",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.flights.requests"
  },
  {
    "id": "item.flights__requests.enquiry_bookings",
    "kind": "domain_item",
    "screenId": "04",
    "mapId": "hub.flights.requests",
    "hubId": "flights.requests",
    "labels": {
      "ar": "طلبات الاستفسار"
    },
    "keywords": [
      "طلبات",
      "الاستفسار",
      "الحجز",
      "الوارده",
      "enquiry_bookings"
    ],
    "collection": "enquiry_bookings",
    "capabilityRefs": [
      "collection.enquiry_bookings.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.flights.requests"
  },
  {
    "id": "item.flights__settings.api_admin_flights_connect_test",
    "kind": "domain_item",
    "screenId": "04",
    "mapId": "hub.flights.settings",
    "hubId": "flights.settings",
    "labels": {
      "ar": "اختبار اتصال الموزع"
    },
    "keywords": [
      "اختبار",
      "اتصال",
      "الموزع",
      "اعدادات",
      "موزعي",
      "gds",
      "/api/admin/flights-connect-test"
    ],
    "route": "/api/admin/flights-connect-test",
    "capabilityRefs": [
      "probe.flights_connect_test",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.flights.settings"
  },
  {
    "id": "item.flights__settings.api_admin_flights_settings",
    "kind": "domain_item",
    "screenId": "04",
    "mapId": "hub.flights.settings",
    "hubId": "flights.settings",
    "labels": {
      "ar": "إعدادات الطيران"
    },
    "keywords": [
      "اعدادات",
      "الطيران",
      "موزعي",
      "gds",
      "/api/admin/flights-settings"
    ],
    "route": "/api/admin/flights-settings",
    "capabilityRefs": [
      "probe.flights_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.flights.settings"
  },
  {
    "id": "item.flights__settings.api_admin_providers",
    "kind": "domain_item",
    "screenId": "04",
    "mapId": "hub.flights.settings",
    "hubId": "flights.settings",
    "labels": {
      "ar": "مزودو البحث"
    },
    "keywords": [
      "مزودو",
      "البحث",
      "اعدادات",
      "موزعي",
      "gds",
      "/api/admin/providers"
    ],
    "href": "/admin/providers",
    "route": "/api/admin/providers",
    "capabilityRefs": [
      "probe.providers",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.flights.settings"
  },
  {
    "id": "item.growth__ads.api_admin_ads_campaigns",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.ads",
    "hubId": "growth.ads",
    "labels": {
      "ar": "الحملات"
    },
    "keywords": [
      "الحملات",
      "الاعلانات",
      "المموله",
      "/api/admin/ads/campaigns"
    ],
    "route": "/api/admin/ads/campaigns",
    "capabilityRefs": [
      "probe.ads_campaigns",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.ads"
  },
  {
    "id": "item.growth__ads.api_admin_ads_launch",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.ads",
    "hubId": "growth.ads",
    "labels": {
      "ar": "إطلاق حملة"
    },
    "keywords": [
      "اطلاق",
      "حمله",
      "الاعلانات",
      "المموله",
      "/api/admin/ads/launch"
    ],
    "route": "/api/admin/ads/launch",
    "capabilityRefs": [
      "probe.ads_launch",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.ads"
  },
  {
    "id": "item.growth__ads.api_admin_ads_report",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.ads",
    "hubId": "growth.ads",
    "labels": {
      "ar": "التقارير"
    },
    "keywords": [
      "التقارير",
      "الاعلانات",
      "المموله",
      "/api/admin/ads/report"
    ],
    "route": "/api/admin/ads/report",
    "capabilityRefs": [
      "probe.ads_report",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.ads"
  },
  {
    "id": "item.growth__affiliate.affiliate_conversions",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.affiliate",
    "hubId": "growth.affiliate",
    "labels": {
      "ar": "التحويلات"
    },
    "keywords": [
      "التحويلات",
      "التسويق",
      "بالعموله",
      "affiliate_conversions"
    ],
    "collection": "affiliate_conversions",
    "capabilityRefs": [
      "collection.affiliate_conversions.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.affiliate"
  },
  {
    "id": "item.growth__affiliate.affiliate_profiles",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.affiliate",
    "hubId": "growth.affiliate",
    "labels": {
      "ar": "المسوقون"
    },
    "keywords": [
      "المسوقون",
      "التسويق",
      "بالعموله",
      "affiliate_profiles"
    ],
    "collection": "affiliate_profiles",
    "capabilityRefs": [
      "collection.affiliate_profiles.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.affiliate"
  },
  {
    "id": "item.growth__affiliate.affiliate_visits",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.affiliate",
    "hubId": "growth.affiliate",
    "labels": {
      "ar": "الزيارات"
    },
    "keywords": [
      "الزيارات",
      "التسويق",
      "بالعموله",
      "affiliate_visits"
    ],
    "collection": "affiliate_visits",
    "capabilityRefs": [
      "collection.affiliate_visits.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.affiliate"
  },
  {
    "id": "item.growth__affiliate.affiliate_withdrawals",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.affiliate",
    "hubId": "growth.affiliate",
    "labels": {
      "ar": "السحوبات"
    },
    "keywords": [
      "السحوبات",
      "التسويق",
      "بالعموله",
      "affiliate_withdrawals"
    ],
    "collection": "affiliate_withdrawals",
    "capabilityRefs": [
      "collection.affiliate_withdrawals.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.affiliate"
  },
  {
    "id": "item.growth__coupons.api_admin_loyalty",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.coupons",
    "hubId": "growth.coupons",
    "labels": {
      "ar": "واجهة الولاء"
    },
    "keywords": [
      "واجهه",
      "الولاء",
      "الكوبونات",
      "والولاء",
      "/api/admin/loyalty"
    ],
    "route": "/api/admin/loyalty",
    "capabilityRefs": [
      "probe.loyalty",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.coupons"
  },
  {
    "id": "item.growth__coupons.loyalty_wallets",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.coupons",
    "hubId": "growth.coupons",
    "labels": {
      "ar": "محافظ الولاء"
    },
    "keywords": [
      "محافظ",
      "الولاء",
      "الكوبونات",
      "والولاء",
      "loyalty_wallets"
    ],
    "collection": "loyalty_wallets",
    "capabilityRefs": [
      "collection.loyalty_wallets.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.coupons"
  },
  {
    "id": "item.growth__email.email_campaigns",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.email",
    "hubId": "growth.email",
    "labels": {
      "ar": "الحملات البريدية"
    },
    "keywords": [
      "الحملات",
      "البريديه",
      "التسويق",
      "بالبريد",
      "email_campaigns"
    ],
    "collection": "email_campaigns",
    "capabilityRefs": [
      "collection.email_campaigns.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.email"
  },
  {
    "id": "item.growth__email.email_recipients",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.email",
    "hubId": "growth.email",
    "labels": {
      "ar": "المستلمون"
    },
    "keywords": [
      "المستلمون",
      "التسويق",
      "بالبريد",
      "email_recipients"
    ],
    "collection": "email_recipients",
    "capabilityRefs": [
      "collection.email_recipients.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.email"
  },
  {
    "id": "item.growth__email.email_templates",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.email",
    "hubId": "growth.email",
    "labels": {
      "ar": "القوالب"
    },
    "keywords": [
      "القوالب",
      "التسويق",
      "بالبريد",
      "email_templates"
    ],
    "collection": "email_templates",
    "capabilityRefs": [
      "collection.email_templates.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.email"
  },
  {
    "id": "item.growth__gifts.api_admin_gift_cards",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.gifts",
    "hubId": "growth.gifts",
    "labels": {
      "ar": "بطاقات الهدايا"
    },
    "keywords": [
      "بطاقات",
      "الهدايا",
      "/api/admin/gift-cards"
    ],
    "route": "/api/admin/gift-cards",
    "capabilityRefs": [
      "probe.gift_cards",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.gifts"
  },
  {
    "id": "item.growth__recovery.api_admin_automation_abandoned_recovery",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.recovery",
    "hubId": "growth.recovery",
    "labels": {
      "ar": "الاسترجاع الآلي"
    },
    "keywords": [
      "الاسترجاع",
      "الالي",
      "استرجاع",
      "السلات",
      "/api/admin/automation/abandoned-recovery"
    ],
    "route": "/api/admin/automation/abandoned-recovery",
    "capabilityRefs": [
      "probe.automation_abandoned_recovery",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.recovery"
  },
  {
    "id": "item.growth__recovery.api_admin_automation_excluded_contacts",
    "kind": "domain_item",
    "screenId": "10",
    "mapId": "hub.growth.recovery",
    "hubId": "growth.recovery",
    "labels": {
      "ar": "المستثنون"
    },
    "keywords": [
      "المستثنون",
      "استرجاع",
      "السلات",
      "/api/admin/automation/excluded-contacts"
    ],
    "route": "/api/admin/automation/excluded-contacts",
    "capabilityRefs": [
      "probe.automation_excluded_contacts",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.growth.recovery"
  },
  {
    "id": "item.hotels__bookings.hotel_bookings",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.bookings",
    "hubId": "hotels.bookings",
    "labels": {
      "ar": "الحجوزات"
    },
    "keywords": [
      "الحجوزات",
      "حجوزات",
      "الفنادق",
      "hotel_bookings"
    ],
    "collection": "hotel_bookings",
    "capabilityRefs": [
      "collection.hotel_bookings.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.bookings"
  },
  {
    "id": "item.hotels__bookings.hotel_quotes",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.bookings",
    "hubId": "hotels.bookings",
    "labels": {
      "ar": "عروض الأسعار"
    },
    "keywords": [
      "عروض",
      "الاسعار",
      "حجوزات",
      "الفنادق",
      "hotel_quotes"
    ],
    "collection": "hotel_quotes",
    "capabilityRefs": [
      "collection.hotel_quotes.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.bookings"
  },
  {
    "id": "item.hotels__catalog.hotel_facilities",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.catalog",
    "hubId": "hotels.catalog",
    "labels": {
      "ar": "المرافق"
    },
    "keywords": [
      "المرافق",
      "الكتالوج",
      "الداخلي",
      "hotel_facilities"
    ],
    "collection": "hotel_facilities",
    "capabilityRefs": [
      "collection.hotel_facilities.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.catalog"
  },
  {
    "id": "item.hotels__catalog.hotel_images",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.catalog",
    "hubId": "hotels.catalog",
    "labels": {
      "ar": "الصور"
    },
    "keywords": [
      "الصور",
      "الكتالوج",
      "الداخلي",
      "hotel_images"
    ],
    "collection": "hotel_images",
    "capabilityRefs": [
      "collection.hotel_images.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.catalog"
  },
  {
    "id": "item.hotels__catalog.hotel_masters",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.catalog",
    "hubId": "hotels.catalog",
    "labels": {
      "ar": "الفنادق الرئيسية"
    },
    "keywords": [
      "الفنادق",
      "الرئيسيه",
      "الكتالوج",
      "الداخلي",
      "hotel_masters"
    ],
    "collection": "hotel_masters",
    "capabilityRefs": [
      "collection.hotel_masters.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.catalog"
  },
  {
    "id": "item.hotels__catalog.hotel_rooms_content",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.catalog",
    "hubId": "hotels.catalog",
    "labels": {
      "ar": "محتوى الغرف"
    },
    "keywords": [
      "محتوي",
      "الغرف",
      "الكتالوج",
      "الداخلي",
      "hotel_rooms_content"
    ],
    "collection": "hotel_rooms_content",
    "capabilityRefs": [
      "collection.hotel_rooms_content.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.catalog"
  },
  {
    "id": "item.hotels__content.api_admin_hotels_featured_sync",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.content",
    "hubId": "hotels.content",
    "labels": {
      "ar": "مزامنة المميزة"
    },
    "keywords": [
      "مزامنه",
      "المميزه",
      "ومهام",
      "المحتوي",
      "/api/admin/hotels/featured-sync"
    ],
    "route": "/api/admin/hotels/featured-sync",
    "capabilityRefs": [
      "probe.hotels_featured_sync",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.content"
  },
  {
    "id": "item.hotels__content.hotel_content_jobs",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.content",
    "hubId": "hotels.content",
    "labels": {
      "ar": "مهام محتوى الفنادق"
    },
    "keywords": [
      "مهام",
      "محتوي",
      "الفنادق",
      "المميزه",
      "ومهام",
      "المحتوي",
      "hotel_content_jobs"
    ],
    "collection": "hotel_content_jobs",
    "capabilityRefs": [
      "collection.hotel_content_jobs.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.content"
  },
  {
    "id": "item.hotels__destinations.hotel_destinations",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.destinations",
    "hubId": "hotels.destinations",
    "labels": {
      "ar": "الوجهات"
    },
    "keywords": [
      "الوجهات",
      "والمعالم",
      "hotel_destinations"
    ],
    "collection": "hotel_destinations",
    "capabilityRefs": [
      "collection.hotel_destinations.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.destinations"
  },
  {
    "id": "item.hotels__destinations.hotel_pois",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.destinations",
    "hubId": "hotels.destinations",
    "labels": {
      "ar": "نقاط الاهتمام"
    },
    "keywords": [
      "نقاط",
      "الاهتمام",
      "الوجهات",
      "والمعالم",
      "hotel_pois"
    ],
    "collection": "hotel_pois",
    "capabilityRefs": [
      "collection.hotel_pois.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.destinations"
  },
  {
    "id": "item.hotels__owned.api_admin_owned_hotels_test",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.owned",
    "hubId": "hotels.owned",
    "labels": {
      "ar": "اختبار الربط"
    },
    "keywords": [
      "اختبار",
      "الربط",
      "الفنادق",
      "المملوكه",
      "/api/admin/owned-hotels-test"
    ],
    "route": "/api/admin/owned-hotels-test",
    "capabilityRefs": [
      "probe.owned_hotels_test",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.owned"
  },
  {
    "id": "item.hotels__owned.owned_hotels",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.owned",
    "hubId": "hotels.owned",
    "labels": {
      "ar": "الفنادق المملوكة"
    },
    "keywords": [
      "الفنادق",
      "المملوكه",
      "owned_hotels"
    ],
    "collection": "owned_hotels",
    "capabilityRefs": [
      "collection.owned_hotels.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.owned"
  },
  {
    "id": "item.hotels__owned.owned_rate_snapshots",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.owned",
    "hubId": "hotels.owned",
    "labels": {
      "ar": "لقطات الأسعار"
    },
    "keywords": [
      "لقطات",
      "الاسعار",
      "الفنادق",
      "المملوكه",
      "owned_rate_snapshots"
    ],
    "collection": "owned_rate_snapshots",
    "capabilityRefs": [
      "collection.owned_rate_snapshots.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.owned"
  },
  {
    "id": "item.hotels__reviews.api_admin_reviews_agent",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.reviews",
    "hubId": "hotels.reviews",
    "labels": {
      "ar": "وكيل التقييمات"
    },
    "keywords": [
      "وكيل",
      "التقييمات",
      "تقييمات",
      "الفنادق",
      "/api/admin/reviews/agent"
    ],
    "route": "/api/admin/reviews/agent",
    "capabilityRefs": [
      "probe.reviews_agent",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.reviews"
  },
  {
    "id": "item.hotels__reviews.hotel_guest_reviews",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.reviews",
    "hubId": "hotels.reviews",
    "labels": {
      "ar": "تقييمات النزلاء"
    },
    "keywords": [
      "تقييمات",
      "النزلاء",
      "الفنادق",
      "hotel_guest_reviews"
    ],
    "collection": "hotel_guest_reviews",
    "capabilityRefs": [
      "collection.hotel_guest_reviews.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.reviews"
  },
  {
    "id": "item.hotels__reviews.hotel_identity_reviews",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.reviews",
    "hubId": "hotels.reviews",
    "labels": {
      "ar": "تقييمات الهوية"
    },
    "keywords": [
      "تقييمات",
      "الهويه",
      "الفنادق",
      "hotel_identity_reviews"
    ],
    "collection": "hotel_identity_reviews",
    "capabilityRefs": [
      "collection.hotel_identity_reviews.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.reviews"
  },
  {
    "id": "item.hotels__reviews.hotel_review_scores",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.reviews",
    "hubId": "hotels.reviews",
    "labels": {
      "ar": "درجات التقييم"
    },
    "keywords": [
      "درجات",
      "التقييم",
      "تقييمات",
      "الفنادق",
      "hotel_review_scores"
    ],
    "collection": "hotel_review_scores",
    "capabilityRefs": [
      "collection.hotel_review_scores.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.reviews"
  },
  {
    "id": "item.hotels__suppliers.api_admin_hotel_supply",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.suppliers",
    "hubId": "hotels.suppliers",
    "labels": {
      "ar": "توريد الفنادق"
    },
    "keywords": [
      "توريد",
      "الفنادق",
      "مزودو",
      "ومارك",
      "اب",
      "/api/admin/hotel-supply"
    ],
    "href": "/admin/hotels/supply",
    "route": "/api/admin/hotel-supply",
    "capabilityRefs": [
      "probe.hotel_supply",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.suppliers"
  },
  {
    "id": "item.hotels__suppliers.api_admin_hotels_settings",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.suppliers",
    "hubId": "hotels.suppliers",
    "labels": {
      "ar": "إعدادات الفنادق"
    },
    "keywords": [
      "اعدادات",
      "الفنادق",
      "مزودو",
      "ومارك",
      "اب",
      "/api/admin/hotels-settings"
    ],
    "route": "/api/admin/hotels-settings",
    "capabilityRefs": [
      "probe.hotels_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.suppliers"
  },
  {
    "id": "item.hotels__suppliers.hotel_supplier_refs",
    "kind": "domain_item",
    "screenId": "05",
    "mapId": "hub.hotels.suppliers",
    "hubId": "hotels.suppliers",
    "labels": {
      "ar": "مراجع الموردين"
    },
    "keywords": [
      "مراجع",
      "الموردين",
      "مزودو",
      "ومارك",
      "اب",
      "الفنادق",
      "hotel_supplier_refs"
    ],
    "collection": "hotel_supplier_refs",
    "capabilityRefs": [
      "collection.hotel_supplier_refs.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.hotels.suppliers"
  },
  {
    "id": "item.legal__access.api_admin_platform_readiness",
    "kind": "domain_item",
    "screenId": "15",
    "mapId": "hub.legal.access",
    "hubId": "legal.access",
    "labels": {
      "ar": "جاهزية المنصة"
    },
    "keywords": [
      "جاهزيه",
      "المنصه",
      "الجلسات",
      "والصلاحيات",
      "/api/admin/platform-readiness"
    ],
    "route": "/api/admin/platform-readiness",
    "capabilityRefs": [
      "probe.platform_readiness",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.legal.access"
  },
  {
    "id": "item.legal__access.api_admin_session",
    "kind": "domain_item",
    "screenId": "15",
    "mapId": "hub.legal.access",
    "hubId": "legal.access",
    "labels": {
      "ar": "جلسة المشرف"
    },
    "keywords": [
      "جلسه",
      "المشرف",
      "الجلسات",
      "والصلاحيات",
      "/api/admin/session"
    ],
    "route": "/api/admin/session",
    "capabilityRefs": [],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.legal.access"
  },
  {
    "id": "item.legal__access.users",
    "kind": "domain_item",
    "screenId": "15",
    "mapId": "hub.legal.access",
    "hubId": "legal.access",
    "labels": {
      "ar": "المستخدمون"
    },
    "keywords": [
      "المستخدمون",
      "الجلسات",
      "والصلاحيات",
      "users"
    ],
    "collection": "users",
    "capabilityRefs": [
      "collection.users.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.legal.access"
  },
  {
    "id": "item.legal__clauses.api_admin_legal",
    "kind": "domain_item",
    "screenId": "15",
    "mapId": "hub.legal.clauses",
    "hubId": "legal.clauses",
    "labels": {
      "ar": "المستندات"
    },
    "keywords": [
      "المستندات",
      "الشروط",
      "والبنود",
      "/api/admin/legal"
    ],
    "route": "/api/admin/legal",
    "capabilityRefs": [
      "probe.legal",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.legal.clauses"
  },
  {
    "id": "item.legal__clauses.api_admin_legal_clauses",
    "kind": "domain_item",
    "screenId": "15",
    "mapId": "hub.legal.clauses",
    "hubId": "legal.clauses",
    "labels": {
      "ar": "البنود القانونية"
    },
    "keywords": [
      "البنود",
      "القانونيه",
      "الشروط",
      "والبنود",
      "/api/admin/legal/clauses"
    ],
    "route": "/api/admin/legal/clauses",
    "capabilityRefs": [
      "probe.legal_clauses",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.legal.clauses"
  },
  {
    "id": "item.legal__identity.api_admin_branding",
    "kind": "domain_item",
    "screenId": "15",
    "mapId": "hub.legal.identity",
    "hubId": "legal.identity",
    "labels": {
      "ar": "الهوية البصرية"
    },
    "keywords": [
      "الهويه",
      "البصريه",
      "هويه",
      "المنصه",
      "/api/admin/branding"
    ],
    "route": "/api/admin/branding",
    "capabilityRefs": [
      "probe.branding",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.legal.identity"
  },
  {
    "id": "item.legal__identity.api_admin_site_contact",
    "kind": "domain_item",
    "screenId": "15",
    "mapId": "hub.legal.identity",
    "hubId": "legal.identity",
    "labels": {
      "ar": "بيانات التواصل"
    },
    "keywords": [
      "بيانات",
      "التواصل",
      "هويه",
      "المنصه",
      "/api/admin/site-contact"
    ],
    "route": "/api/admin/site-contact",
    "capabilityRefs": [
      "probe.site_contact",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.legal.identity"
  },
  {
    "id": "item.legal__license.api_admin_license_status",
    "kind": "domain_item",
    "screenId": "15",
    "mapId": "hub.legal.license",
    "hubId": "legal.license",
    "labels": {
      "ar": "حالة الترخيص"
    },
    "keywords": [
      "حاله",
      "الترخيص",
      "والخطه",
      "/api/admin/license/status"
    ],
    "route": "/api/admin/license/status",
    "capabilityRefs": [
      "probe.license_status",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.legal.license"
  },
  {
    "id": "item.legal__license.api_admin_tenant_plan",
    "kind": "domain_item",
    "screenId": "15",
    "mapId": "hub.legal.license",
    "hubId": "legal.license",
    "labels": {
      "ar": "خطة المستأجر"
    },
    "keywords": [
      "خطه",
      "المستاجر",
      "الترخيص",
      "والخطه",
      "/api/admin/tenant-plan"
    ],
    "route": "/api/admin/tenant-plan",
    "capabilityRefs": [
      "probe.tenant_plan",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.legal.license"
  },
  {
    "id": "item.legal__privacy.api_admin_legal_ai_advisor",
    "kind": "domain_item",
    "screenId": "15",
    "mapId": "hub.legal.privacy",
    "hubId": "legal.privacy",
    "labels": {
      "ar": "المستشار القانوني"
    },
    "keywords": [
      "المستشار",
      "القانوني",
      "الخصوصيه",
      "وgdpr",
      "/api/admin/legal/ai-advisor"
    ],
    "route": "/api/admin/legal/ai-advisor",
    "capabilityRefs": [
      "probe.legal_ai_advisor",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.legal.privacy"
  },
  {
    "id": "item.legal__privacy.api_admin_legal_deletions",
    "kind": "domain_item",
    "screenId": "15",
    "mapId": "hub.legal.privacy",
    "hubId": "legal.privacy",
    "labels": {
      "ar": "طلبات الحذف"
    },
    "keywords": [
      "طلبات",
      "الحذف",
      "الخصوصيه",
      "وgdpr",
      "/api/admin/legal/deletions"
    ],
    "route": "/api/admin/legal/deletions",
    "capabilityRefs": [
      "probe.legal_deletions",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.legal.privacy"
  },
  {
    "id": "item.mobility__cars.api_admin_cars",
    "kind": "domain_item",
    "screenId": "06",
    "mapId": "hub.mobility.cars",
    "hubId": "mobility.cars",
    "labels": {
      "ar": "السيارات"
    },
    "keywords": [
      "السيارات",
      "تاجير",
      "/api/admin/cars"
    ],
    "route": "/api/admin/cars",
    "capabilityRefs": [
      "probe.cars",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.mobility.cars"
  },
  {
    "id": "item.mobility__cars.api_admin_cars_settings",
    "kind": "domain_item",
    "screenId": "06",
    "mapId": "hub.mobility.cars",
    "hubId": "mobility.cars",
    "labels": {
      "ar": "إعدادات السيارات"
    },
    "keywords": [
      "اعدادات",
      "السيارات",
      "تاجير",
      "/api/admin/cars-settings"
    ],
    "route": "/api/admin/cars-settings",
    "capabilityRefs": [
      "probe.cars_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.mobility.cars"
  },
  {
    "id": "item.mobility__enquiries.enquiry_bookings",
    "kind": "domain_item",
    "screenId": "06",
    "mapId": "hub.mobility.enquiries",
    "hubId": "mobility.enquiries",
    "labels": {
      "ar": "طلبات الاستفسار"
    },
    "keywords": [
      "طلبات",
      "الاستفسار",
      "الخدمات",
      "enquiry_bookings"
    ],
    "collection": "enquiry_bookings",
    "capabilityRefs": [
      "collection.enquiry_bookings.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.mobility.enquiries"
  },
  {
    "id": "item.mobility__packages.api_admin_packages",
    "kind": "domain_item",
    "screenId": "06",
    "mapId": "hub.mobility.packages",
    "hubId": "mobility.packages",
    "labels": {
      "ar": "إدارة الباقات"
    },
    "keywords": [
      "اداره",
      "الباقات",
      "والعروض",
      "/api/admin/packages"
    ],
    "route": "/api/admin/packages",
    "capabilityRefs": [
      "probe.packages",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.mobility.packages"
  },
  {
    "id": "item.mobility__tours.api_admin_tours",
    "kind": "domain_item",
    "screenId": "06",
    "mapId": "hub.mobility.tours",
    "hubId": "mobility.tours",
    "labels": {
      "ar": "الجولات"
    },
    "keywords": [
      "الجولات",
      "اليوميه",
      "/api/admin/tours"
    ],
    "route": "/api/admin/tours",
    "capabilityRefs": [
      "probe.tours",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.mobility.tours"
  },
  {
    "id": "item.mobility__transfers.api_admin_transfers_settings",
    "kind": "domain_item",
    "screenId": "06",
    "mapId": "hub.mobility.transfers",
    "hubId": "mobility.transfers",
    "labels": {
      "ar": "إعدادات الترانسفير"
    },
    "keywords": [
      "اعدادات",
      "الترانسفير",
      "المواصلات",
      "والاستقبال",
      "/api/admin/transfers-settings"
    ],
    "route": "/api/admin/transfers-settings",
    "capabilityRefs": [
      "probe.transfers_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.mobility.transfers"
  },
  {
    "id": "item.mobility__visa.0",
    "kind": "domain_item",
    "screenId": "06",
    "mapId": "hub.mobility.visa",
    "hubId": "mobility.visa",
    "labels": {
      "ar": "صفحة التأشيرات"
    },
    "keywords": [
      "صفحه",
      "التاشيرات",
      "خدمات"
    ],
    "href": "/admin/visa",
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.mobility.visa"
  },
  {
    "id": "item.publish__accounts.api_admin_publish_channels",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.accounts",
    "hubId": "publish.accounts",
    "labels": {
      "ar": "واجهة القنوات"
    },
    "keywords": [
      "واجهه",
      "القنوات",
      "الحسابات",
      "المرتبطه",
      "/api/admin/publish/channels"
    ],
    "route": "/api/admin/publish/channels",
    "capabilityRefs": [
      "probe.publish_channels",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.accounts"
  },
  {
    "id": "item.publish__accounts.publish_channel_groups",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.accounts",
    "hubId": "publish.accounts",
    "labels": {
      "ar": "مجموعات القنوات"
    },
    "keywords": [
      "مجموعات",
      "القنوات",
      "الحسابات",
      "المرتبطه",
      "publish_channel_groups"
    ],
    "collection": "publish_channel_groups",
    "capabilityRefs": [
      "collection.publish_channel_groups.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.accounts"
  },
  {
    "id": "item.publish__accounts.publish_channels",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.accounts",
    "hubId": "publish.accounts",
    "labels": {
      "ar": "القنوات"
    },
    "keywords": [
      "القنوات",
      "الحسابات",
      "المرتبطه",
      "publish_channels"
    ],
    "collection": "publish_channels",
    "capabilityRefs": [
      "collection.publish_channels.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.accounts"
  },
  {
    "id": "item.publish__agent.api_admin_publish_agent",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.agent",
    "hubId": "publish.agent",
    "labels": {
      "ar": "واجهة الوكيل"
    },
    "keywords": [
      "واجهه",
      "الوكيل",
      "وكيل",
      "النشر",
      "/api/admin/publish/agent"
    ],
    "route": "/api/admin/publish/agent",
    "capabilityRefs": [
      "probe.publish_agent",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.agent"
  },
  {
    "id": "item.publish__agent.api_admin_publish_request_approval",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.agent",
    "hubId": "publish.agent",
    "labels": {
      "ar": "طلب الاعتماد"
    },
    "keywords": [
      "طلب",
      "الاعتماد",
      "وكيل",
      "النشر",
      "/api/admin/publish/request-approval"
    ],
    "route": "/api/admin/publish/request-approval",
    "capabilityRefs": [
      "probe.publish_request_approval",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.agent"
  },
  {
    "id": "item.publish__analytics.api_admin_publish_analytics",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.analytics",
    "hubId": "publish.analytics",
    "labels": {
      "ar": "تحليلات القنوات"
    },
    "keywords": [
      "تحليلات",
      "القنوات",
      "التحليلات",
      "والاداء",
      "/api/admin/publish/analytics"
    ],
    "route": "/api/admin/publish/analytics",
    "capabilityRefs": [
      "probe.publish_analytics",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.analytics"
  },
  {
    "id": "item.publish__analytics.publish_mentions",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.analytics",
    "hubId": "publish.analytics",
    "labels": {
      "ar": "الإشارات"
    },
    "keywords": [
      "الاشارات",
      "التحليلات",
      "والاداء",
      "publish_mentions"
    ],
    "collection": "publish_mentions",
    "capabilityRefs": [
      "collection.publish_mentions.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.analytics"
  },
  {
    "id": "item.publish__analytics.publish_post_comments",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.analytics",
    "hubId": "publish.analytics",
    "labels": {
      "ar": "التعليقات"
    },
    "keywords": [
      "التعليقات",
      "التحليلات",
      "والاداء",
      "publish_post_comments"
    ],
    "collection": "publish_post_comments",
    "capabilityRefs": [
      "collection.publish_post_comments.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.analytics"
  },
  {
    "id": "item.publish__calendar.api_admin_publish_posts",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.calendar",
    "hubId": "publish.calendar",
    "labels": {
      "ar": "واجهة المنشورات"
    },
    "keywords": [
      "واجهه",
      "المنشورات",
      "التقويم",
      "والجدوله",
      "/api/admin/publish/posts"
    ],
    "route": "/api/admin/publish/posts",
    "capabilityRefs": [
      "probe.publish_posts",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.calendar"
  },
  {
    "id": "item.publish__calendar.api_admin_publish_tick",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.calendar",
    "hubId": "publish.calendar",
    "labels": {
      "ar": "دورة الجدولة"
    },
    "keywords": [
      "دوره",
      "الجدوله",
      "التقويم",
      "والجدوله",
      "/api/admin/publish/tick"
    ],
    "route": "/api/admin/publish/tick",
    "capabilityRefs": [
      "probe.publish_tick",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.calendar"
  },
  {
    "id": "item.publish__calendar.publish_posts",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.calendar",
    "hubId": "publish.calendar",
    "labels": {
      "ar": "المنشورات"
    },
    "keywords": [
      "المنشورات",
      "التقويم",
      "والجدوله",
      "publish_posts"
    ],
    "collection": "publish_posts",
    "capabilityRefs": [
      "collection.publish_posts.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.calendar"
  },
  {
    "id": "item.publish__compose.publish_sets",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.compose",
    "hubId": "publish.compose",
    "labels": {
      "ar": "مجموعات النشر"
    },
    "keywords": [
      "مجموعات",
      "النشر",
      "صانع",
      "المحتوي",
      "publish_sets"
    ],
    "collection": "publish_sets",
    "capabilityRefs": [
      "collection.publish_sets.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.compose"
  },
  {
    "id": "item.publish__compose.publish_signatures",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.compose",
    "hubId": "publish.compose",
    "labels": {
      "ar": "التواقيع"
    },
    "keywords": [
      "التواقيع",
      "صانع",
      "المحتوي",
      "publish_signatures"
    ],
    "collection": "publish_signatures",
    "capabilityRefs": [
      "collection.publish_signatures.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.compose"
  },
  {
    "id": "item.publish__compose.publish_tags",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.compose",
    "hubId": "publish.compose",
    "labels": {
      "ar": "الوسوم"
    },
    "keywords": [
      "الوسوم",
      "صانع",
      "المحتوي",
      "publish_tags"
    ],
    "collection": "publish_tags",
    "capabilityRefs": [
      "collection.publish_tags.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.compose"
  },
  {
    "id": "item.publish__media.api_admin_publish_media",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.media",
    "hubId": "publish.media",
    "labels": {
      "ar": "واجهة الوسائط"
    },
    "keywords": [
      "واجهه",
      "الوسائط",
      "مكتبه",
      "/api/admin/publish/media"
    ],
    "route": "/api/admin/publish/media",
    "capabilityRefs": [
      "probe.publish_media",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.media"
  },
  {
    "id": "item.publish__media.api_admin_publish_video",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.media",
    "hubId": "publish.media",
    "labels": {
      "ar": "توليد الفيديو"
    },
    "keywords": [
      "توليد",
      "الفيديو",
      "مكتبه",
      "الوسائط",
      "/api/admin/publish/video"
    ],
    "route": "/api/admin/publish/video",
    "capabilityRefs": [
      "probe.publish_video",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.media"
  },
  {
    "id": "item.publish__media.publish_media",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.media",
    "hubId": "publish.media",
    "labels": {
      "ar": "وسائط النشر"
    },
    "keywords": [
      "وسائط",
      "النشر",
      "مكتبه",
      "الوسائط",
      "publish_media"
    ],
    "collection": "publish_media",
    "capabilityRefs": [
      "collection.publish_media.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.media"
  },
  {
    "id": "item.publish__rss.api_admin_publish_rss",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.rss",
    "hubId": "publish.rss",
    "labels": {
      "ar": "واجهة RSS"
    },
    "keywords": [
      "واجهه",
      "rss",
      "الاتمته",
      "وrss",
      "/api/admin/publish/rss"
    ],
    "route": "/api/admin/publish/rss",
    "capabilityRefs": [
      "probe.publish_rss",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.rss"
  },
  {
    "id": "item.publish__rss.publish_plugs",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.rss",
    "hubId": "publish.rss",
    "labels": {
      "ar": "الإضافات"
    },
    "keywords": [
      "الاضافات",
      "الاتمته",
      "وrss",
      "publish_plugs"
    ],
    "collection": "publish_plugs",
    "capabilityRefs": [
      "collection.publish_plugs.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.rss"
  },
  {
    "id": "item.publish__rss.publish_rss_feeds",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.rss",
    "hubId": "publish.rss",
    "labels": {
      "ar": "خلاصات RSS"
    },
    "keywords": [
      "خلاصات",
      "rss",
      "الاتمته",
      "وrss",
      "publish_rss_feeds"
    ],
    "collection": "publish_rss_feeds",
    "capabilityRefs": [
      "collection.publish_rss_feeds.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.rss"
  },
  {
    "id": "item.publish__settings.publish_errors",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.settings",
    "hubId": "publish.settings",
    "labels": {
      "ar": "أخطاء النشر"
    },
    "keywords": [
      "اخطاء",
      "النشر",
      "اعدادات",
      "القنوات",
      "publish_errors"
    ],
    "collection": "publish_errors",
    "capabilityRefs": [
      "collection.publish_errors.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.settings"
  },
  {
    "id": "item.publish__settings.publish_notifications",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.settings",
    "hubId": "publish.settings",
    "labels": {
      "ar": "إشعارات النشر"
    },
    "keywords": [
      "اشعارات",
      "النشر",
      "اعدادات",
      "القنوات",
      "publish_notifications"
    ],
    "collection": "publish_notifications",
    "capabilityRefs": [
      "collection.publish_notifications.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.settings"
  },
  {
    "id": "item.publish__settings.publish_webhooks",
    "kind": "domain_item",
    "screenId": "09",
    "mapId": "hub.publish.settings",
    "hubId": "publish.settings",
    "labels": {
      "ar": "خطافات الويب"
    },
    "keywords": [
      "خطافات",
      "الويب",
      "اعدادات",
      "القنوات",
      "publish_webhooks"
    ],
    "collection": "publish_webhooks",
    "capabilityRefs": [
      "collection.publish_webhooks.list",
      "studio.open_table",
      "records.list"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.publish.settings"
  },
  {
    "id": "item.sys__database.api_admin_pocketbase",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.database",
    "hubId": "sys.database",
    "labels": {
      "ar": "حالة القاعدة"
    },
    "keywords": [
      "حاله",
      "القاعده",
      "قاعده",
      "pocketbase",
      "/api/admin/pocketbase"
    ],
    "route": "/api/admin/pocketbase",
    "capabilityRefs": [
      "probe.pocketbase",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.database"
  },
  {
    "id": "item.sys__database.api_admin_pocketbase_superuser",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.database",
    "hubId": "sys.database",
    "labels": {
      "ar": "المشرف الأعلى"
    },
    "keywords": [
      "المشرف",
      "الاعلي",
      "قاعده",
      "pocketbase",
      "/api/admin/pocketbase/superuser"
    ],
    "route": "/api/admin/pocketbase/superuser",
    "capabilityRefs": [],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.database"
  },
  {
    "id": "item.sys__icons.api_admin_branding",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.icons",
    "hubId": "sys.icons",
    "labels": {
      "ar": "الهوية البصرية"
    },
    "keywords": [
      "الهويه",
      "البصريه",
      "الايقونات",
      "والهويه",
      "/api/admin/branding"
    ],
    "route": "/api/admin/branding",
    "capabilityRefs": [
      "probe.branding",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.icons"
  },
  {
    "id": "item.sys__icons.api_admin_ui_icons",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.icons",
    "hubId": "sys.icons",
    "labels": {
      "ar": "أيقونات الواجهة"
    },
    "keywords": [
      "ايقونات",
      "الواجهه",
      "الايقونات",
      "والهويه",
      "/api/admin/ui-icons"
    ],
    "route": "/api/admin/ui-icons",
    "capabilityRefs": [
      "probe.ui_icons",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.icons"
  },
  {
    "id": "item.sys__integrations.api_admin_env",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.integrations",
    "hubId": "sys.integrations",
    "labels": {
      "ar": "متغيرات البيئة"
    },
    "keywords": [
      "متغيرات",
      "البيئه",
      "الربط",
      "وwebhooks",
      "/api/admin/env"
    ],
    "route": "/api/admin/env",
    "capabilityRefs": [],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.integrations"
  },
  {
    "id": "item.sys__integrations.api_admin_integrations",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.integrations",
    "hubId": "sys.integrations",
    "labels": {
      "ar": "التكاملات"
    },
    "keywords": [
      "التكاملات",
      "الربط",
      "وwebhooks",
      "/api/admin/integrations"
    ],
    "route": "/api/admin/integrations",
    "capabilityRefs": [
      "probe.integrations",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.integrations"
  },
  {
    "id": "item.sys__media.api_admin_media_keys",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.media",
    "hubId": "sys.media",
    "labels": {
      "ar": "المفاتيح"
    },
    "keywords": [
      "المفاتيح",
      "مفاتيح",
      "الوسائط",
      "/api/admin/media/keys"
    ],
    "route": "/api/admin/media/keys",
    "capabilityRefs": [
      "probe.media_keys",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.media"
  },
  {
    "id": "item.sys__media.api_admin_media_pexels",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.media",
    "hubId": "sys.media",
    "labels": {
      "ar": "Pexels"
    },
    "keywords": [
      "pexels",
      "مفاتيح",
      "الوسائط",
      "/api/admin/media/pexels"
    ],
    "route": "/api/admin/media/pexels",
    "capabilityRefs": [
      "probe.media_pexels",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.media"
  },
  {
    "id": "item.sys__media.api_admin_media_unsplash",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.media",
    "hubId": "sys.media",
    "labels": {
      "ar": "Unsplash"
    },
    "keywords": [
      "unsplash",
      "مفاتيح",
      "الوسائط",
      "/api/admin/media/unsplash"
    ],
    "route": "/api/admin/media/unsplash",
    "capabilityRefs": [
      "probe.media_unsplash",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.media"
  },
  {
    "id": "item.sys__providers.api_admin_providers",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.providers",
    "hubId": "sys.providers",
    "labels": {
      "ar": "المزودون"
    },
    "keywords": [
      "المزودون",
      "مزودو",
      "البحث",
      "/api/admin/providers"
    ],
    "route": "/api/admin/providers",
    "capabilityRefs": [
      "probe.providers",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.providers"
  },
  {
    "id": "item.sys__providers.api_admin_providers_test",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.providers",
    "hubId": "sys.providers",
    "labels": {
      "ar": "اختبار المزود"
    },
    "keywords": [
      "اختبار",
      "المزود",
      "مزودو",
      "البحث",
      "/api/admin/providers/test"
    ],
    "route": "/api/admin/providers/test",
    "capabilityRefs": [
      "probe.providers_test",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.providers"
  },
  {
    "id": "item.sys__smtp.api_admin_email_settings",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.smtp",
    "hubId": "sys.smtp",
    "labels": {
      "ar": "إعدادات البريد"
    },
    "keywords": [
      "اعدادات",
      "البريد",
      "خادم",
      "smtp",
      "/api/admin/email-settings"
    ],
    "route": "/api/admin/email-settings",
    "capabilityRefs": [
      "probe.email_settings",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.smtp"
  },
  {
    "id": "item.sys__smtp.api_admin_email_settings_dns",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.smtp",
    "hubId": "sys.smtp",
    "labels": {
      "ar": "سجلات DNS"
    },
    "keywords": [
      "سجلات",
      "dns",
      "خادم",
      "البريد",
      "smtp",
      "/api/admin/email-settings/dns"
    ],
    "route": "/api/admin/email-settings/dns",
    "capabilityRefs": [
      "probe.email_settings_dns",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.smtp"
  },
  {
    "id": "item.sys__smtp.api_admin_email_settings_test",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.smtp",
    "hubId": "sys.smtp",
    "labels": {
      "ar": "اختبار الإرسال"
    },
    "keywords": [
      "اختبار",
      "الارسال",
      "خادم",
      "البريد",
      "smtp",
      "/api/admin/email-settings/test"
    ],
    "route": "/api/admin/email-settings/test",
    "capabilityRefs": [
      "probe.email_settings_test",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.smtp"
  },
  {
    "id": "item.sys__translations.api_admin_translations",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.translations",
    "hubId": "sys.translations",
    "labels": {
      "ar": "الترجمات"
    },
    "keywords": [
      "الترجمات",
      "/api/admin/translations"
    ],
    "route": "/api/admin/translations",
    "capabilityRefs": [
      "probe.translations",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.translations"
  },
  {
    "id": "item.sys__translations.api_admin_translations_translate_batch",
    "kind": "domain_item",
    "screenId": "16",
    "mapId": "hub.sys.translations",
    "hubId": "sys.translations",
    "labels": {
      "ar": "ترجمة دفعة"
    },
    "keywords": [
      "ترجمه",
      "دفعه",
      "الترجمات",
      "/api/admin/translations/translate-batch"
    ],
    "route": "/api/admin/translations/translate-batch",
    "capabilityRefs": [
      "probe.translations_translate_batch",
      "admin.route.call"
    ],
    "defaultIntent": "probe",
    "risk": "low",
    "evidence": "domain-systems.ts",
    "parentId": "hub.sys.translations"
  },
  {
    "id": "nav.group.ai_center",
    "kind": "nav_group",
    "screenId": "11",
    "mapId": "group.ai_center",
    "labels": {
      "ar": "الذكاء الاصطناعي"
    },
    "keywords": [
      "الذكاء",
      "الاصطناعي",
      "ai_center"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "screen.01"
  },
  {
    "id": "nav.group.bookings",
    "kind": "nav_group",
    "screenId": "03",
    "mapId": "group.bookings",
    "labels": {
      "ar": "الحجوزات"
    },
    "keywords": [
      "الحجوزات",
      "bookings"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "screen.01"
  },
  {
    "id": "nav.group.customers",
    "kind": "nav_group",
    "screenId": "08",
    "mapId": "group.customers",
    "labels": {
      "ar": "العملاء"
    },
    "keywords": [
      "العملاء",
      "customers"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "screen.01"
  },
  {
    "id": "nav.group.finance",
    "kind": "nav_group",
    "screenId": "13",
    "mapId": "group.finance",
    "labels": {
      "ar": "المالية"
    },
    "keywords": [
      "الماليه",
      "finance"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "screen.01"
  },
  {
    "id": "nav.group.inventory",
    "kind": "nav_group",
    "screenId": "05",
    "mapId": "group.inventory",
    "labels": {
      "ar": "الخدمات"
    },
    "keywords": [
      "الخدمات",
      "inventory"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "screen.01"
  },
  {
    "id": "nav.group.legal",
    "kind": "nav_group",
    "screenId": "15",
    "mapId": "group.legal",
    "labels": {
      "ar": "الامتثال القانوني"
    },
    "keywords": [
      "الامتثال",
      "القانوني",
      "legal"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "screen.01"
  },
  {
    "id": "nav.group.marketing",
    "kind": "nav_group",
    "screenId": "09",
    "mapId": "group.marketing",
    "labels": {
      "ar": "التسويق والنشر"
    },
    "keywords": [
      "التسويق",
      "والنشر",
      "marketing"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "screen.01"
  },
  {
    "id": "nav.group.overview",
    "kind": "nav_group",
    "screenId": "01",
    "mapId": "group.overview",
    "labels": {
      "ar": "نظرة عامة"
    },
    "keywords": [
      "نظره",
      "عامه",
      "overview"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "screen.01"
  },
  {
    "id": "nav.group.resale",
    "kind": "nav_group",
    "screenId": "14",
    "mapId": "group.resale",
    "labels": {
      "ar": "إعادة البيع"
    },
    "keywords": [
      "اعاده",
      "البيع",
      "resale"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "screen.01"
  },
  {
    "id": "nav.group.storefront",
    "kind": "nav_group",
    "screenId": "07",
    "mapId": "group.storefront",
    "labels": {
      "ar": "محتوى الموقع"
    },
    "keywords": [
      "محتوي",
      "الموقع",
      "storefront"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "screen.01"
  },
  {
    "id": "nav.group.system",
    "kind": "nav_group",
    "screenId": "16",
    "mapId": "group.system",
    "labels": {
      "ar": "الإعدادات"
    },
    "keywords": [
      "الاعدادات",
      "system"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "screen.01"
  },
  {
    "id": "nav.leaf.agent-studio",
    "kind": "nav_leaf",
    "screenId": "11",
    "mapId": "group.ai_center",
    "labels": {
      "ar": "استوديو الوكلاء"
    },
    "keywords": [
      "استوديو",
      "الوكلاء",
      "agent-studio",
      "الذكاء",
      "الاصطناعي"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.ai_center"
  },
  {
    "id": "nav.leaf.agent-war-room",
    "kind": "nav_leaf",
    "screenId": "11",
    "mapId": "group.ai_center",
    "labels": {
      "ar": "غرفة الوكلاء"
    },
    "keywords": [
      "غرفه",
      "الوكلاء",
      "agent-war-room",
      "الذكاء",
      "الاصطناعي"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.ai_center"
  },
  {
    "id": "nav.leaf.automation-hub",
    "kind": "nav_leaf",
    "screenId": "11",
    "mapId": "group.ai_center",
    "labels": {
      "ar": "الأتمتة"
    },
    "keywords": [
      "الاتمته",
      "automation-hub",
      "الذكاء",
      "الاصطناعي"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.ai_center"
  },
  {
    "id": "nav.leaf.b2b-landing-agent",
    "kind": "nav_leaf",
    "screenId": "11",
    "mapId": "group.ai_center",
    "labels": {
      "ar": "وكيل B2B"
    },
    "keywords": [
      "وكيل",
      "b2b",
      "b2b-landing-agent",
      "الذكاء",
      "الاصطناعي"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.ai_center"
  },
  {
    "id": "nav.leaf.b2b-wallet",
    "kind": "nav_leaf",
    "screenId": "13",
    "mapId": "group.finance",
    "labels": {
      "ar": "محفظة B2B"
    },
    "keywords": [
      "محفظه",
      "b2b",
      "b2b-wallet",
      "الماليه"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.finance"
  },
  {
    "id": "nav.leaf.blog",
    "kind": "nav_leaf",
    "screenId": "07",
    "mapId": "group.storefront",
    "labels": {
      "ar": "المقالات"
    },
    "keywords": [
      "المقالات",
      "blog",
      "محتوي",
      "الموقع"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.storefront"
  },
  {
    "id": "nav.leaf.bookings-all",
    "kind": "nav_leaf",
    "screenId": "03",
    "mapId": "group.bookings",
    "labels": {
      "ar": "الحجوزات"
    },
    "keywords": [
      "الحجوزات",
      "bookings-all"
    ],
    "collection": "hotel_bookings",
    "capabilityRefs": [
      "collection.hotel_bookings.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.bookings"
  },
  {
    "id": "nav.leaf.builder-agent",
    "kind": "nav_leaf",
    "screenId": "11",
    "mapId": "group.ai_center",
    "labels": {
      "ar": "وكيل البناء"
    },
    "keywords": [
      "وكيل",
      "البناء",
      "builder-agent",
      "الذكاء",
      "الاصطناعي"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.ai_center"
  },
  {
    "id": "nav.leaf.cancellations",
    "kind": "nav_leaf",
    "screenId": "03",
    "mapId": "group.bookings",
    "labels": {
      "ar": "طلبات الإلغاء"
    },
    "keywords": [
      "طلبات",
      "الالغاء",
      "cancellations",
      "الحجوزات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.bookings"
  },
  {
    "id": "nav.leaf.cars",
    "kind": "nav_leaf",
    "screenId": "05",
    "mapId": "group.inventory",
    "labels": {
      "ar": "تأجير السيارات"
    },
    "keywords": [
      "تاجير",
      "السيارات",
      "cars",
      "الخدمات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.inventory"
  },
  {
    "id": "nav.leaf.currencies",
    "kind": "nav_leaf",
    "screenId": "13",
    "mapId": "group.finance",
    "labels": {
      "ar": "العملات"
    },
    "keywords": [
      "العملات",
      "currencies",
      "الماليه"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.finance"
  },
  {
    "id": "nav.leaf.customer-reviews",
    "kind": "nav_leaf",
    "screenId": "03",
    "mapId": "group.bookings",
    "labels": {
      "ar": "تقييمات العملاء الموثقة"
    },
    "keywords": [
      "تقييمات",
      "العملاء",
      "الموثقه",
      "customer-reviews",
      "الحجوزات"
    ],
    "collection": "customer_reviews",
    "capabilityRefs": [
      "collection.customer_reviews.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.bookings"
  },
  {
    "id": "nav.leaf.customer-reviews-mgmt",
    "kind": "nav_leaf",
    "screenId": "08",
    "mapId": "group.customers",
    "labels": {
      "ar": "التقييمات"
    },
    "keywords": [
      "التقييمات",
      "customer-reviews-mgmt",
      "العملاء"
    ],
    "collection": "hotel_guest_reviews",
    "capabilityRefs": [
      "collection.hotel_guest_reviews.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.customers"
  },
  {
    "id": "nav.leaf.customers",
    "kind": "nav_leaf",
    "screenId": "08",
    "mapId": "group.customers",
    "labels": {
      "ar": "إدارة العملاء"
    },
    "keywords": [
      "اداره",
      "العملاء",
      "customers"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.customers"
  },
  {
    "id": "nav.leaf.dashboard",
    "kind": "nav_leaf",
    "screenId": "01",
    "mapId": "group.overview",
    "labels": {
      "ar": "لوحة المعلومات"
    },
    "keywords": [
      "لوحه",
      "المعلومات",
      "dashboard",
      "نظره",
      "عامه"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.overview"
  },
  {
    "id": "nav.leaf.deletion-requests",
    "kind": "nav_leaf",
    "screenId": "08",
    "mapId": "group.customers",
    "labels": {
      "ar": "حذف الحسابات"
    },
    "keywords": [
      "حذف",
      "الحسابات",
      "deletion-requests",
      "العملاء"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.customers"
  },
  {
    "id": "nav.leaf.flights",
    "kind": "nav_leaf",
    "screenId": "05",
    "mapId": "group.inventory",
    "labels": {
      "ar": "الرحلات"
    },
    "keywords": [
      "الرحلات",
      "flights",
      "الخدمات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.inventory"
  },
  {
    "id": "nav.leaf.homepage",
    "kind": "nav_leaf",
    "screenId": "07",
    "mapId": "group.storefront",
    "labels": {
      "ar": "محرر بصري AI"
    },
    "keywords": [
      "محرر",
      "بصري",
      "ai",
      "homepage",
      "محتوي",
      "الموقع"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.storefront"
  },
  {
    "id": "nav.leaf.hotels",
    "kind": "nav_leaf",
    "screenId": "05",
    "mapId": "group.inventory",
    "labels": {
      "ar": "الفنادق"
    },
    "keywords": [
      "الفنادق",
      "hotels",
      "الخدمات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.inventory"
  },
  {
    "id": "nav.leaf.invoices",
    "kind": "nav_leaf",
    "screenId": "13",
    "mapId": "group.finance",
    "labels": {
      "ar": "الفواتير"
    },
    "keywords": [
      "الفواتير",
      "invoices",
      "الماليه"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.finance"
  },
  {
    "id": "nav.leaf.legal-gdpr",
    "kind": "nav_leaf",
    "screenId": "15",
    "mapId": "group.legal",
    "labels": {
      "ar": "GDPR"
    },
    "keywords": [
      "gdpr",
      "legal-gdpr",
      "الامتثال",
      "القانوني"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.legal"
  },
  {
    "id": "nav.leaf.legal-identity",
    "kind": "nav_leaf",
    "screenId": "15",
    "mapId": "group.legal",
    "labels": {
      "ar": "الهوية"
    },
    "keywords": [
      "الهويه",
      "legal-identity",
      "الامتثال",
      "القانوني"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.legal"
  },
  {
    "id": "nav.leaf.legal-privacy",
    "kind": "nav_leaf",
    "screenId": "15",
    "mapId": "group.legal",
    "labels": {
      "ar": "الخصوصية"
    },
    "keywords": [
      "الخصوصيه",
      "legal-privacy",
      "الامتثال",
      "القانوني"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.legal"
  },
  {
    "id": "nav.leaf.legal-terms",
    "kind": "nav_leaf",
    "screenId": "15",
    "mapId": "group.legal",
    "labels": {
      "ar": "الشروط"
    },
    "keywords": [
      "الشروط",
      "legal-terms",
      "الامتثال",
      "القانوني"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.legal"
  },
  {
    "id": "nav.leaf.loyalty-points",
    "kind": "nav_leaf",
    "screenId": "13",
    "mapId": "group.finance",
    "labels": {
      "ar": "نقاط الولاء"
    },
    "keywords": [
      "نقاط",
      "الولاء",
      "loyalty-points",
      "الماليه"
    ],
    "collection": "loyalty_wallets",
    "capabilityRefs": [
      "collection.loyalty_wallets.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.finance"
  },
  {
    "id": "nav.leaf.media-keys",
    "kind": "nav_leaf",
    "screenId": "16",
    "mapId": "group.system",
    "labels": {
      "ar": "الوسائط"
    },
    "keywords": [
      "الوسائط",
      "media-keys",
      "الاعدادات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.system"
  },
  {
    "id": "nav.leaf.mobile-app",
    "kind": "nav_leaf",
    "screenId": "07",
    "mapId": "group.storefront",
    "labels": {
      "ar": "تطبيق الجوال"
    },
    "keywords": [
      "تطبيق",
      "الجوال",
      "mobile-app",
      "محتوي",
      "الموقع"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.storefront"
  },
  {
    "id": "nav.leaf.packages",
    "kind": "nav_leaf",
    "screenId": "05",
    "mapId": "group.inventory",
    "labels": {
      "ar": "الباقات"
    },
    "keywords": [
      "الباقات",
      "packages",
      "الخدمات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.inventory"
  },
  {
    "id": "nav.leaf.pages",
    "kind": "nav_leaf",
    "screenId": "07",
    "mapId": "group.storefront",
    "labels": {
      "ar": "الصفحات"
    },
    "keywords": [
      "الصفحات",
      "pages",
      "محتوي",
      "الموقع"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.storefront"
  },
  {
    "id": "nav.leaf.paid-ads",
    "kind": "nav_leaf",
    "screenId": "09",
    "mapId": "group.marketing",
    "labels": {
      "ar": "الحملات"
    },
    "keywords": [
      "الحملات",
      "paid-ads",
      "التسويق",
      "والنشر"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.marketing"
  },
  {
    "id": "nav.leaf.payments",
    "kind": "nav_leaf",
    "screenId": "13",
    "mapId": "group.finance",
    "labels": {
      "ar": "الدفع"
    },
    "keywords": [
      "الدفع",
      "payments",
      "الماليه"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.finance"
  },
  {
    "id": "nav.leaf.pocketbase",
    "kind": "nav_leaf",
    "screenId": "16",
    "mapId": "group.system",
    "labels": {
      "ar": "PocketBase"
    },
    "keywords": [
      "pocketbase",
      "الاعدادات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.system"
  },
  {
    "id": "nav.leaf.publish-automations",
    "kind": "nav_leaf",
    "screenId": "09",
    "mapId": "group.marketing",
    "labels": {
      "ar": "RSS"
    },
    "keywords": [
      "rss",
      "publish-automations",
      "التسويق",
      "والنشر"
    ],
    "collection": "publish_rss_feeds",
    "capabilityRefs": [
      "collection.publish_rss_feeds.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.marketing"
  },
  {
    "id": "nav.leaf.publish-calendar",
    "kind": "nav_leaf",
    "screenId": "09",
    "mapId": "group.marketing",
    "labels": {
      "ar": "التقويم"
    },
    "keywords": [
      "التقويم",
      "publish-calendar",
      "التسويق",
      "والنشر"
    ],
    "collection": "publish_posts",
    "capabilityRefs": [
      "collection.publish_posts.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.marketing"
  },
  {
    "id": "nav.leaf.publish-compose",
    "kind": "nav_leaf",
    "screenId": "09",
    "mapId": "group.marketing",
    "labels": {
      "ar": "المحتوى"
    },
    "keywords": [
      "المحتوي",
      "publish-compose",
      "التسويق",
      "والنشر"
    ],
    "collection": "publish_sets",
    "capabilityRefs": [
      "collection.publish_sets.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.marketing"
  },
  {
    "id": "nav.leaf.publish-media",
    "kind": "nav_leaf",
    "screenId": "09",
    "mapId": "group.marketing",
    "labels": {
      "ar": "الوسائط"
    },
    "keywords": [
      "الوسائط",
      "publish-media",
      "التسويق",
      "والنشر"
    ],
    "collection": "publish_media",
    "capabilityRefs": [
      "collection.publish_media.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.marketing"
  },
  {
    "id": "nav.leaf.pwa",
    "kind": "nav_leaf",
    "screenId": "07",
    "mapId": "group.storefront",
    "labels": {
      "ar": "تطبيق الويب"
    },
    "keywords": [
      "تطبيق",
      "الويب",
      "pwa",
      "محتوي",
      "الموقع"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.storefront"
  },
  {
    "id": "nav.leaf.resale-companies",
    "kind": "nav_leaf",
    "screenId": "14",
    "mapId": "group.resale",
    "labels": {
      "ar": "الشركات"
    },
    "keywords": [
      "الشركات",
      "resale-companies",
      "اعاده",
      "البيع"
    ],
    "collection": "reseller_companies",
    "capabilityRefs": [
      "collection.reseller_companies.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.resale"
  },
  {
    "id": "nav.leaf.resale-domains",
    "kind": "nav_leaf",
    "screenId": "14",
    "mapId": "group.resale",
    "labels": {
      "ar": "النطاقات"
    },
    "keywords": [
      "النطاقات",
      "resale-domains",
      "اعاده",
      "البيع"
    ],
    "collection": "reseller_domain_events",
    "capabilityRefs": [
      "collection.reseller_domain_events.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.resale"
  },
  {
    "id": "nav.leaf.resale-licenses",
    "kind": "nav_leaf",
    "screenId": "14",
    "mapId": "group.resale",
    "labels": {
      "ar": "التراخيص"
    },
    "keywords": [
      "التراخيص",
      "resale-licenses",
      "اعاده",
      "البيع"
    ],
    "collection": "reseller_licenses",
    "capabilityRefs": [
      "collection.reseller_licenses.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.resale"
  },
  {
    "id": "nav.leaf.resale-subscriptions",
    "kind": "nav_leaf",
    "screenId": "14",
    "mapId": "group.resale",
    "labels": {
      "ar": "الاشتراكات"
    },
    "keywords": [
      "الاشتراكات",
      "resale-subscriptions",
      "اعاده",
      "البيع"
    ],
    "collection": "reseller_subscriptions",
    "capabilityRefs": [
      "collection.reseller_subscriptions.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.resale"
  },
  {
    "id": "nav.leaf.resale-updates",
    "kind": "nav_leaf",
    "screenId": "14",
    "mapId": "group.resale",
    "labels": {
      "ar": "التحديثات"
    },
    "keywords": [
      "التحديثات",
      "resale-updates",
      "اعاده",
      "البيع"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.resale"
  },
  {
    "id": "nav.leaf.resale-wallets",
    "kind": "nav_leaf",
    "screenId": "14",
    "mapId": "group.resale",
    "labels": {
      "ar": "المحافظ"
    },
    "keywords": [
      "المحافظ",
      "resale-wallets",
      "اعاده",
      "البيع"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.resale"
  },
  {
    "id": "nav.leaf.resale-whitelabel",
    "kind": "nav_leaf",
    "screenId": "14",
    "mapId": "group.resale",
    "labels": {
      "ar": "الوايت ليبل"
    },
    "keywords": [
      "الوايت",
      "ليبل",
      "resale-whitelabel",
      "اعاده",
      "البيع"
    ],
    "collection": "reseller_whitelabel_settings",
    "capabilityRefs": [
      "collection.reseller_whitelabel_settings.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.resale"
  },
  {
    "id": "nav.leaf.search-providers",
    "kind": "nav_leaf",
    "screenId": "16",
    "mapId": "group.system",
    "labels": {
      "ar": "مزودو البحث"
    },
    "keywords": [
      "مزودو",
      "البحث",
      "search-providers",
      "الاعدادات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.system"
  },
  {
    "id": "nav.leaf.search-tabs",
    "kind": "nav_leaf",
    "screenId": "07",
    "mapId": "group.storefront",
    "labels": {
      "ar": "تبويبات البحث"
    },
    "keywords": [
      "تبويبات",
      "البحث",
      "search-tabs",
      "محتوي",
      "الموقع"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.storefront"
  },
  {
    "id": "nav.leaf.smtp",
    "kind": "nav_leaf",
    "screenId": "16",
    "mapId": "group.system",
    "labels": {
      "ar": "SMTP"
    },
    "keywords": [
      "smtp",
      "الاعدادات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.system"
  },
  {
    "id": "nav.leaf.social-accounts",
    "kind": "nav_leaf",
    "screenId": "09",
    "mapId": "group.marketing",
    "labels": {
      "ar": "الحسابات"
    },
    "keywords": [
      "الحسابات",
      "social-accounts",
      "التسويق",
      "والنشر"
    ],
    "collection": "publish_channels",
    "capabilityRefs": [
      "collection.publish_channels.list",
      "studio.open_table"
    ],
    "defaultIntent": "open_table",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.marketing"
  },
  {
    "id": "nav.leaf.tours",
    "kind": "nav_leaf",
    "screenId": "05",
    "mapId": "group.inventory",
    "labels": {
      "ar": "الجولات"
    },
    "keywords": [
      "الجولات",
      "tours",
      "الخدمات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.inventory"
  },
  {
    "id": "nav.leaf.transfers",
    "kind": "nav_leaf",
    "screenId": "05",
    "mapId": "group.inventory",
    "labels": {
      "ar": "الترانسفير VIP"
    },
    "keywords": [
      "الترانسفير",
      "vip",
      "transfers",
      "الخدمات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.inventory"
  },
  {
    "id": "nav.leaf.translations",
    "kind": "nav_leaf",
    "screenId": "16",
    "mapId": "group.system",
    "labels": {
      "ar": "الترجمات"
    },
    "keywords": [
      "الترجمات",
      "translations",
      "الاعدادات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.system"
  },
  {
    "id": "nav.leaf.visa",
    "kind": "nav_leaf",
    "screenId": "05",
    "mapId": "group.inventory",
    "labels": {
      "ar": "التأشيرات"
    },
    "keywords": [
      "التاشيرات",
      "visa",
      "الخدمات"
    ],
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "maps.ts:GROUPS",
    "parentId": "nav.group.inventory"
  },
  {
    "id": "nexus.sector.nexus-ads",
    "kind": "domain_hub",
    "screenId": "21",
    "hubId": "ads",
    "labels": {
      "ar": "حملات الإعلانات"
    },
    "keywords": [
      "حملات",
      "الاعلانات",
      "ads"
    ],
    "capabilityRefs": [
      "nexus.rotate",
      "nexus.run_sector_command",
      "studio.open_screen"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "HolographicCylinderStage:NEXUS_SECTOR_CARDS"
  },
  {
    "id": "nexus.sector.nexus-b2b",
    "kind": "domain_hub",
    "screenId": "21",
    "hubId": "b2b",
    "labels": {
      "ar": "شبكة B2B والموزعين"
    },
    "keywords": [
      "شبكه",
      "b2b",
      "والموزعين"
    ],
    "capabilityRefs": [
      "nexus.rotate",
      "nexus.run_sector_command",
      "studio.open_screen"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "HolographicCylinderStage:NEXUS_SECTOR_CARDS"
  },
  {
    "id": "nexus.sector.nexus-flights",
    "kind": "domain_hub",
    "screenId": "21",
    "hubId": "flights",
    "labels": {
      "ar": "رادار تذاكر الطيران"
    },
    "keywords": [
      "رادار",
      "تذاكر",
      "الطيران",
      "flights"
    ],
    "capabilityRefs": [
      "nexus.rotate",
      "nexus.run_sector_command",
      "studio.open_screen"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "HolographicCylinderStage:NEXUS_SECTOR_CARDS"
  },
  {
    "id": "nexus.sector.nexus-hotels",
    "kind": "domain_hub",
    "screenId": "21",
    "hubId": "hotels",
    "labels": {
      "ar": "محرك الفنادق والـ GDS"
    },
    "keywords": [
      "محرك",
      "الفنادق",
      "والـ",
      "gds",
      "hotels"
    ],
    "capabilityRefs": [
      "nexus.rotate",
      "nexus.run_sector_command",
      "studio.open_screen"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "HolographicCylinderStage:NEXUS_SECTOR_CARDS"
  },
  {
    "id": "nexus.sector.nexus-social",
    "kind": "domain_hub",
    "screenId": "21",
    "hubId": "social",
    "labels": {
      "ar": "النشر والسوشيال"
    },
    "keywords": [
      "النشر",
      "والسوشيال",
      "social"
    ],
    "capabilityRefs": [
      "nexus.rotate",
      "nexus.run_sector_command",
      "studio.open_screen"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "HolographicCylinderStage:NEXUS_SECTOR_CARDS"
  },
  {
    "id": "nexus.sector.nexus-transfers",
    "kind": "domain_hub",
    "screenId": "21",
    "hubId": "transfers",
    "labels": {
      "ar": "النقل والمواصلات"
    },
    "keywords": [
      "النقل",
      "والمواصلات",
      "transfers"
    ],
    "capabilityRefs": [
      "nexus.rotate",
      "nexus.run_sector_command",
      "studio.open_screen"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "HolographicCylinderStage:NEXUS_SECTOR_CARDS"
  },
  {
    "id": "page.admin.ads",
    "kind": "admin_page",
    "labels": {
      "ar": "ads",
      "en": "ads"
    },
    "keywords": [
      "ads",
      "/admin/ads"
    ],
    "href": "/admin/ads",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/ads/page.tsx"
  },
  {
    "id": "page.admin.affiliate",
    "kind": "admin_page",
    "labels": {
      "ar": "affiliate",
      "en": "affiliate"
    },
    "keywords": [
      "affiliate",
      "/admin/affiliate"
    ],
    "href": "/admin/affiliate",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/affiliate/page.tsx"
  },
  {
    "id": "page.admin.agent-studio",
    "kind": "admin_page",
    "labels": {
      "ar": "agent-studio",
      "en": "agent-studio"
    },
    "keywords": [
      "agent-studio",
      "/admin/agent-studio"
    ],
    "href": "/admin/agent-studio",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/agent-studio/page.tsx"
  },
  {
    "id": "page.admin.agent-war-room",
    "kind": "admin_page",
    "labels": {
      "ar": "agent-war-room",
      "en": "agent-war-room"
    },
    "keywords": [
      "agent-war-room",
      "/admin/agent-war-room"
    ],
    "href": "/admin/agent-war-room",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/agent-war-room/page.tsx"
  },
  {
    "id": "page.admin.ai-feedback",
    "kind": "admin_page",
    "labels": {
      "ar": "ai-feedback",
      "en": "ai-feedback"
    },
    "keywords": [
      "ai-feedback",
      "/admin/ai-feedback"
    ],
    "href": "/admin/ai-feedback",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/ai-feedback/page.tsx"
  },
  {
    "id": "page.admin.ai-programs",
    "kind": "admin_page",
    "labels": {
      "ar": "ai-programs",
      "en": "ai-programs"
    },
    "keywords": [
      "ai-programs",
      "/admin/ai-programs"
    ],
    "href": "/admin/ai-programs",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/ai-programs/page.tsx"
  },
  {
    "id": "page.admin.ai-settings",
    "kind": "admin_page",
    "labels": {
      "ar": "ai-settings",
      "en": "ai-settings"
    },
    "keywords": [
      "ai-settings",
      "/admin/ai-settings"
    ],
    "href": "/admin/ai-settings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/ai-settings/page.tsx"
  },
  {
    "id": "page.admin.automation",
    "kind": "admin_page",
    "labels": {
      "ar": "automation",
      "en": "automation"
    },
    "keywords": [
      "automation",
      "/admin/automation"
    ],
    "href": "/admin/automation",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/automation/page.tsx"
  },
  {
    "id": "page.admin.automation-studio",
    "kind": "admin_page",
    "labels": {
      "ar": "automation-studio",
      "en": "automation-studio"
    },
    "keywords": [
      "automation-studio",
      "/admin/automation-studio"
    ],
    "href": "/admin/automation-studio",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/automation-studio/page.tsx"
  },
  {
    "id": "page.admin.b2b-landing-agent",
    "kind": "admin_page",
    "labels": {
      "ar": "b2b-landing-agent",
      "en": "b2b-landing-agent"
    },
    "keywords": [
      "b2b-landing-agent",
      "/admin/b2b-landing-agent"
    ],
    "href": "/admin/b2b-landing-agent",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/b2b-landing-agent/page.tsx"
  },
  {
    "id": "page.admin.b2b-wallet",
    "kind": "admin_page",
    "labels": {
      "ar": "b2b-wallet",
      "en": "b2b-wallet"
    },
    "keywords": [
      "b2b-wallet",
      "/admin/b2b-wallet"
    ],
    "href": "/admin/b2b-wallet",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/b2b-wallet/page.tsx"
  },
  {
    "id": "page.admin.blog",
    "kind": "admin_page",
    "labels": {
      "ar": "blog",
      "en": "blog"
    },
    "keywords": [
      "blog",
      "/admin/blog"
    ],
    "href": "/admin/blog",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/blog/page.tsx"
  },
  {
    "id": "page.admin.blog__id",
    "kind": "admin_page",
    "labels": {
      "ar": "blog/:id",
      "en": "blog/:id"
    },
    "keywords": [
      "blog",
      ":id",
      "/admin/blog/:id"
    ],
    "href": "/admin/blog/:id",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/blog/[id]/page.tsx"
  },
  {
    "id": "page.admin.bookings",
    "kind": "admin_page",
    "labels": {
      "ar": "bookings",
      "en": "bookings"
    },
    "keywords": [
      "bookings",
      "/admin/bookings"
    ],
    "href": "/admin/bookings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/bookings/page.tsx"
  },
  {
    "id": "page.admin.branding",
    "kind": "admin_page",
    "labels": {
      "ar": "branding",
      "en": "branding"
    },
    "keywords": [
      "branding",
      "/admin/branding"
    ],
    "href": "/admin/branding",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/branding/page.tsx"
  },
  {
    "id": "page.admin.builder-agent",
    "kind": "admin_page",
    "labels": {
      "ar": "builder-agent",
      "en": "builder-agent"
    },
    "keywords": [
      "builder-agent",
      "/admin/builder-agent"
    ],
    "href": "/admin/builder-agent",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/builder-agent/page.tsx"
  },
  {
    "id": "page.admin.cancellations",
    "kind": "admin_page",
    "labels": {
      "ar": "cancellations",
      "en": "cancellations"
    },
    "keywords": [
      "cancellations",
      "/admin/cancellations"
    ],
    "href": "/admin/cancellations",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/cancellations/page.tsx"
  },
  {
    "id": "page.admin.cars",
    "kind": "admin_page",
    "labels": {
      "ar": "cars",
      "en": "cars"
    },
    "keywords": [
      "cars",
      "/admin/cars"
    ],
    "href": "/admin/cars",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/cars/page.tsx"
  },
  {
    "id": "page.admin.contact-settings",
    "kind": "admin_page",
    "labels": {
      "ar": "contact-settings",
      "en": "contact-settings"
    },
    "keywords": [
      "contact-settings",
      "/admin/contact-settings"
    ],
    "href": "/admin/contact-settings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/contact-settings/page.tsx"
  },
  {
    "id": "page.admin.content",
    "kind": "admin_page",
    "labels": {
      "ar": "content",
      "en": "content"
    },
    "keywords": [
      "content",
      "/admin/content"
    ],
    "href": "/admin/content",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/content/page.tsx"
  },
  {
    "id": "page.admin.currencies",
    "kind": "admin_page",
    "labels": {
      "ar": "currencies",
      "en": "currencies"
    },
    "keywords": [
      "currencies",
      "/admin/currencies"
    ],
    "href": "/admin/currencies",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/currencies/page.tsx"
  },
  {
    "id": "page.admin.customers",
    "kind": "admin_page",
    "labels": {
      "ar": "customers",
      "en": "customers"
    },
    "keywords": [
      "customers",
      "/admin/customers"
    ],
    "href": "/admin/customers",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/customers/page.tsx"
  },
  {
    "id": "page.admin.dashboard",
    "kind": "admin_page",
    "labels": {
      "ar": "dashboard",
      "en": "dashboard"
    },
    "keywords": [
      "dashboard",
      "/admin/dashboard"
    ],
    "href": "/admin/dashboard",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/dashboard/page.tsx"
  },
  {
    "id": "page.admin.editor",
    "kind": "admin_page",
    "labels": {
      "ar": "editor",
      "en": "editor"
    },
    "keywords": [
      "editor",
      "/admin/editor"
    ],
    "href": "/admin/editor",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/editor/page.tsx"
  },
  {
    "id": "page.admin.email",
    "kind": "admin_page",
    "labels": {
      "ar": "email",
      "en": "email"
    },
    "keywords": [
      "email",
      "/admin/email"
    ],
    "href": "/admin/email",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/email/page.tsx"
  },
  {
    "id": "page.admin.email-marketing",
    "kind": "admin_page",
    "labels": {
      "ar": "email-marketing",
      "en": "email-marketing"
    },
    "keywords": [
      "email-marketing",
      "/admin/email-marketing"
    ],
    "href": "/admin/email-marketing",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/email-marketing/page.tsx"
  },
  {
    "id": "page.admin.flights",
    "kind": "admin_page",
    "labels": {
      "ar": "flights",
      "en": "flights"
    },
    "keywords": [
      "flights",
      "/admin/flights"
    ],
    "href": "/admin/flights",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/flights/page.tsx"
  },
  {
    "id": "page.admin.gift-cards",
    "kind": "admin_page",
    "labels": {
      "ar": "gift-cards",
      "en": "gift-cards"
    },
    "keywords": [
      "gift-cards",
      "/admin/gift-cards"
    ],
    "href": "/admin/gift-cards",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/gift-cards/page.tsx"
  },
  {
    "id": "page.admin.homepage",
    "kind": "admin_page",
    "labels": {
      "ar": "homepage",
      "en": "homepage"
    },
    "keywords": [
      "homepage",
      "/admin/homepage"
    ],
    "href": "/admin/homepage",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/homepage/page.tsx"
  },
  {
    "id": "page.admin.homepage-editor",
    "kind": "admin_page",
    "labels": {
      "ar": "homepage-editor",
      "en": "homepage-editor"
    },
    "keywords": [
      "homepage-editor",
      "/admin/homepage-editor"
    ],
    "href": "/admin/homepage-editor",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/homepage-editor/page.tsx"
  },
  {
    "id": "page.admin.hotels",
    "kind": "admin_page",
    "labels": {
      "ar": "hotels",
      "en": "hotels"
    },
    "keywords": [
      "hotels",
      "/admin/hotels"
    ],
    "href": "/admin/hotels",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/hotels/page.tsx"
  },
  {
    "id": "page.admin.hotels_catalog",
    "kind": "admin_page",
    "labels": {
      "ar": "hotels/catalog",
      "en": "hotels/catalog"
    },
    "keywords": [
      "hotels",
      "catalog",
      "/admin/hotels/catalog"
    ],
    "href": "/admin/hotels/catalog",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/hotels/catalog/page.tsx"
  },
  {
    "id": "page.admin.hotels_featured",
    "kind": "admin_page",
    "labels": {
      "ar": "hotels/featured",
      "en": "hotels/featured"
    },
    "keywords": [
      "hotels",
      "featured",
      "/admin/hotels/featured"
    ],
    "href": "/admin/hotels/featured",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/hotels/featured/page.tsx"
  },
  {
    "id": "page.admin.hotels_supply",
    "kind": "admin_page",
    "labels": {
      "ar": "hotels/supply",
      "en": "hotels/supply"
    },
    "keywords": [
      "hotels",
      "supply",
      "/admin/hotels/supply"
    ],
    "href": "/admin/hotels/supply",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/hotels/supply/page.tsx"
  },
  {
    "id": "page.admin.icons",
    "kind": "admin_page",
    "labels": {
      "ar": "icons",
      "en": "icons"
    },
    "keywords": [
      "icons",
      "/admin/icons"
    ],
    "href": "/admin/icons",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/icons/page.tsx"
  },
  {
    "id": "page.admin.integrations",
    "kind": "admin_page",
    "labels": {
      "ar": "integrations",
      "en": "integrations"
    },
    "keywords": [
      "integrations",
      "/admin/integrations"
    ],
    "href": "/admin/integrations",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/integrations/page.tsx"
  },
  {
    "id": "page.admin.invoices",
    "kind": "admin_page",
    "labels": {
      "ar": "invoices",
      "en": "invoices"
    },
    "keywords": [
      "invoices",
      "/admin/invoices"
    ],
    "href": "/admin/invoices",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/invoices/page.tsx"
  },
  {
    "id": "page.admin.legal",
    "kind": "admin_page",
    "labels": {
      "ar": "legal",
      "en": "legal"
    },
    "keywords": [
      "legal",
      "/admin/legal"
    ],
    "href": "/admin/legal",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/legal/page.tsx"
  },
  {
    "id": "page.admin.license",
    "kind": "admin_page",
    "labels": {
      "ar": "license",
      "en": "license"
    },
    "keywords": [
      "license",
      "/admin/license"
    ],
    "href": "/admin/license",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/license/page.tsx"
  },
  {
    "id": "page.admin.login",
    "kind": "admin_page",
    "labels": {
      "ar": "login",
      "en": "login"
    },
    "keywords": [
      "login",
      "/admin/login"
    ],
    "href": "/admin/login",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/login/page.tsx"
  },
  {
    "id": "page.admin.marketing_coupons",
    "kind": "admin_page",
    "labels": {
      "ar": "marketing/coupons",
      "en": "marketing/coupons"
    },
    "keywords": [
      "marketing",
      "coupons",
      "/admin/marketing/coupons"
    ],
    "href": "/admin/marketing/coupons",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/marketing/coupons/page.tsx"
  },
  {
    "id": "page.admin.media",
    "kind": "admin_page",
    "labels": {
      "ar": "media",
      "en": "media"
    },
    "keywords": [
      "media",
      "/admin/media"
    ],
    "href": "/admin/media",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/media/page.tsx"
  },
  {
    "id": "page.admin.mobile-app",
    "kind": "admin_page",
    "labels": {
      "ar": "mobile-app",
      "en": "mobile-app"
    },
    "keywords": [
      "mobile-app",
      "/admin/mobile-app"
    ],
    "href": "/admin/mobile-app",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/mobile-app/page.tsx"
  },
  {
    "id": "page.admin.mobile-app-editor",
    "kind": "admin_page",
    "labels": {
      "ar": "mobile-app-editor",
      "en": "mobile-app-editor"
    },
    "keywords": [
      "mobile-app-editor",
      "/admin/mobile-app-editor"
    ],
    "href": "/admin/mobile-app-editor",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/mobile-app-editor/page.tsx"
  },
  {
    "id": "page.admin.neural-studio",
    "kind": "admin_page",
    "labels": {
      "ar": "neural-studio",
      "en": "neural-studio"
    },
    "keywords": [
      "neural-studio",
      "/admin/neural-studio"
    ],
    "href": "/admin/neural-studio",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/neural-studio/page.tsx"
  },
  {
    "id": "page.admin.packages",
    "kind": "admin_page",
    "labels": {
      "ar": "packages",
      "en": "packages"
    },
    "keywords": [
      "packages",
      "/admin/packages"
    ],
    "href": "/admin/packages",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/packages/page.tsx"
  },
  {
    "id": "page.admin.pages",
    "kind": "admin_page",
    "labels": {
      "ar": "pages",
      "en": "pages"
    },
    "keywords": [
      "pages",
      "/admin/pages"
    ],
    "href": "/admin/pages",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/pages/page.tsx"
  },
  {
    "id": "page.admin.payments",
    "kind": "admin_page",
    "labels": {
      "ar": "payments",
      "en": "payments"
    },
    "keywords": [
      "payments",
      "/admin/payments"
    ],
    "href": "/admin/payments",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/payments/page.tsx"
  },
  {
    "id": "page.admin.pocketbase",
    "kind": "admin_page",
    "labels": {
      "ar": "pocketbase",
      "en": "pocketbase"
    },
    "keywords": [
      "pocketbase",
      "/admin/pocketbase"
    ],
    "href": "/admin/pocketbase",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/pocketbase/page.tsx"
  },
  {
    "id": "page.admin.providers",
    "kind": "admin_page",
    "labels": {
      "ar": "providers",
      "en": "providers"
    },
    "keywords": [
      "providers",
      "/admin/providers"
    ],
    "href": "/admin/providers",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/providers/page.tsx"
  },
  {
    "id": "page.admin.publish",
    "kind": "admin_page",
    "labels": {
      "ar": "publish",
      "en": "publish"
    },
    "keywords": [
      "publish",
      "/admin/publish"
    ],
    "href": "/admin/publish",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/publish/page.tsx"
  },
  {
    "id": "page.admin.publish_agent",
    "kind": "admin_page",
    "labels": {
      "ar": "publish/agent",
      "en": "publish/agent"
    },
    "keywords": [
      "publish",
      "agent",
      "/admin/publish/agent"
    ],
    "href": "/admin/publish/agent",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/publish/agent/page.tsx"
  },
  {
    "id": "page.admin.publish_analytics",
    "kind": "admin_page",
    "labels": {
      "ar": "publish/analytics",
      "en": "publish/analytics"
    },
    "keywords": [
      "publish",
      "analytics",
      "/admin/publish/analytics"
    ],
    "href": "/admin/publish/analytics",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/publish/analytics/page.tsx"
  },
  {
    "id": "page.admin.publish_automations",
    "kind": "admin_page",
    "labels": {
      "ar": "publish/automations",
      "en": "publish/automations"
    },
    "keywords": [
      "publish",
      "automations",
      "/admin/publish/automations"
    ],
    "href": "/admin/publish/automations",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/publish/automations/page.tsx"
  },
  {
    "id": "page.admin.publish_compose",
    "kind": "admin_page",
    "labels": {
      "ar": "publish/compose",
      "en": "publish/compose"
    },
    "keywords": [
      "publish",
      "compose",
      "/admin/publish/compose"
    ],
    "href": "/admin/publish/compose",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/publish/compose/page.tsx"
  },
  {
    "id": "page.admin.publish_media",
    "kind": "admin_page",
    "labels": {
      "ar": "publish/media",
      "en": "publish/media"
    },
    "keywords": [
      "publish",
      "media",
      "/admin/publish/media"
    ],
    "href": "/admin/publish/media",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/publish/media/page.tsx"
  },
  {
    "id": "page.admin.publish_settings",
    "kind": "admin_page",
    "labels": {
      "ar": "publish/settings",
      "en": "publish/settings"
    },
    "keywords": [
      "publish",
      "settings",
      "/admin/publish/settings"
    ],
    "href": "/admin/publish/settings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/publish/settings/page.tsx"
  },
  {
    "id": "page.admin.pwa",
    "kind": "admin_page",
    "labels": {
      "ar": "pwa",
      "en": "pwa"
    },
    "keywords": [
      "pwa",
      "/admin/pwa"
    ],
    "href": "/admin/pwa",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/pwa/page.tsx"
  },
  {
    "id": "page.admin.resale",
    "kind": "admin_page",
    "labels": {
      "ar": "resale",
      "en": "resale"
    },
    "keywords": [
      "resale",
      "/admin/resale"
    ],
    "href": "/admin/resale",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/page.tsx"
  },
  {
    "id": "page.admin.resale_bookings",
    "kind": "admin_page",
    "labels": {
      "ar": "resale/bookings",
      "en": "resale/bookings"
    },
    "keywords": [
      "resale",
      "bookings",
      "/admin/resale/bookings"
    ],
    "href": "/admin/resale/bookings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/bookings/page.tsx"
  },
  {
    "id": "page.admin.resale_companies",
    "kind": "admin_page",
    "labels": {
      "ar": "resale/companies",
      "en": "resale/companies"
    },
    "keywords": [
      "resale",
      "companies",
      "/admin/resale/companies"
    ],
    "href": "/admin/resale/companies",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/companies/page.tsx"
  },
  {
    "id": "page.admin.resale_delivery",
    "kind": "admin_page",
    "labels": {
      "ar": "resale/delivery",
      "en": "resale/delivery"
    },
    "keywords": [
      "resale",
      "delivery",
      "/admin/resale/delivery"
    ],
    "href": "/admin/resale/delivery",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/delivery/page.tsx"
  },
  {
    "id": "page.admin.resale_domains",
    "kind": "admin_page",
    "labels": {
      "ar": "resale/domains",
      "en": "resale/domains"
    },
    "keywords": [
      "resale",
      "domains",
      "/admin/resale/domains"
    ],
    "href": "/admin/resale/domains",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/domains/page.tsx"
  },
  {
    "id": "page.admin.resale_licenses",
    "kind": "admin_page",
    "labels": {
      "ar": "resale/licenses",
      "en": "resale/licenses"
    },
    "keywords": [
      "resale",
      "licenses",
      "/admin/resale/licenses"
    ],
    "href": "/admin/resale/licenses",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/licenses/page.tsx"
  },
  {
    "id": "page.admin.resale_scraper",
    "kind": "admin_page",
    "labels": {
      "ar": "resale/scraper",
      "en": "resale/scraper"
    },
    "keywords": [
      "resale",
      "scraper",
      "/admin/resale/scraper"
    ],
    "href": "/admin/resale/scraper",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/scraper/page.tsx"
  },
  {
    "id": "page.admin.resale_settings",
    "kind": "admin_page",
    "labels": {
      "ar": "resale/settings",
      "en": "resale/settings"
    },
    "keywords": [
      "resale",
      "settings",
      "/admin/resale/settings"
    ],
    "href": "/admin/resale/settings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/settings/page.tsx"
  },
  {
    "id": "page.admin.resale_subscriptions",
    "kind": "admin_page",
    "labels": {
      "ar": "resale/subscriptions",
      "en": "resale/subscriptions"
    },
    "keywords": [
      "resale",
      "subscriptions",
      "/admin/resale/subscriptions"
    ],
    "href": "/admin/resale/subscriptions",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/subscriptions/page.tsx"
  },
  {
    "id": "page.admin.resale_updates",
    "kind": "admin_page",
    "labels": {
      "ar": "resale/updates",
      "en": "resale/updates"
    },
    "keywords": [
      "resale",
      "updates",
      "/admin/resale/updates"
    ],
    "href": "/admin/resale/updates",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/updates/page.tsx"
  },
  {
    "id": "page.admin.resale_wallets",
    "kind": "admin_page",
    "labels": {
      "ar": "resale/wallets",
      "en": "resale/wallets"
    },
    "keywords": [
      "resale",
      "wallets",
      "/admin/resale/wallets"
    ],
    "href": "/admin/resale/wallets",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/wallets/page.tsx"
  },
  {
    "id": "page.admin.resale_whitelabel",
    "kind": "admin_page",
    "labels": {
      "ar": "resale/whitelabel",
      "en": "resale/whitelabel"
    },
    "keywords": [
      "resale",
      "whitelabel",
      "/admin/resale/whitelabel"
    ],
    "href": "/admin/resale/whitelabel",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/resale/whitelabel/page.tsx"
  },
  {
    "id": "page.admin.reviews",
    "kind": "admin_page",
    "labels": {
      "ar": "reviews",
      "en": "reviews"
    },
    "keywords": [
      "reviews",
      "/admin/reviews"
    ],
    "href": "/admin/reviews",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/reviews/page.tsx"
  },
  {
    "id": "page.admin.search-tabs",
    "kind": "admin_page",
    "labels": {
      "ar": "search-tabs",
      "en": "search-tabs"
    },
    "keywords": [
      "search-tabs",
      "/admin/search-tabs"
    ],
    "href": "/admin/search-tabs",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/search-tabs/page.tsx"
  },
  {
    "id": "page.admin.settings",
    "kind": "admin_page",
    "labels": {
      "ar": "settings",
      "en": "settings"
    },
    "keywords": [
      "settings",
      "/admin/settings"
    ],
    "href": "/admin/settings",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/settings/page.tsx"
  },
  {
    "id": "page.admin.social-accounts",
    "kind": "admin_page",
    "labels": {
      "ar": "social-accounts",
      "en": "social-accounts"
    },
    "keywords": [
      "social-accounts",
      "/admin/social-accounts"
    ],
    "href": "/admin/social-accounts",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/social-accounts/page.tsx"
  },
  {
    "id": "page.admin.social-community",
    "kind": "admin_page",
    "labels": {
      "ar": "social-community",
      "en": "social-community"
    },
    "keywords": [
      "social-community",
      "/admin/social-community"
    ],
    "href": "/admin/social-community",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/social-community/page.tsx"
  },
  {
    "id": "page.admin.tours",
    "kind": "admin_page",
    "labels": {
      "ar": "tours",
      "en": "tours"
    },
    "keywords": [
      "tours",
      "/admin/tours"
    ],
    "href": "/admin/tours",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/tours/page.tsx"
  },
  {
    "id": "page.admin.transfers",
    "kind": "admin_page",
    "labels": {
      "ar": "transfers",
      "en": "transfers"
    },
    "keywords": [
      "transfers",
      "/admin/transfers"
    ],
    "href": "/admin/transfers",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/transfers/page.tsx"
  },
  {
    "id": "page.admin.translations",
    "kind": "admin_page",
    "labels": {
      "ar": "translations",
      "en": "translations"
    },
    "keywords": [
      "translations",
      "/admin/translations"
    ],
    "href": "/admin/translations",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/translations/page.tsx"
  },
  {
    "id": "page.admin.updates",
    "kind": "admin_page",
    "labels": {
      "ar": "updates",
      "en": "updates"
    },
    "keywords": [
      "updates",
      "/admin/updates"
    ],
    "href": "/admin/updates",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/updates/page.tsx"
  },
  {
    "id": "page.admin.visa",
    "kind": "admin_page",
    "labels": {
      "ar": "visa",
      "en": "visa"
    },
    "keywords": [
      "visa",
      "/admin/visa"
    ],
    "href": "/admin/visa",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/visa/page.tsx"
  },
  {
    "id": "page.admin.visual-editor",
    "kind": "admin_page",
    "labels": {
      "ar": "visual-editor",
      "en": "visual-editor"
    },
    "keywords": [
      "visual-editor",
      "/admin/visual-editor"
    ],
    "href": "/admin/visual-editor",
    "capabilityRefs": [
      "studio.navigate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "src/app/admin/visual-editor/page.tsx"
  },
  {
    "id": "screen.01",
    "kind": "screen",
    "screenId": "01",
    "mapId": "atlas",
    "labels": {
      "ar": "الأطلس العصبي الشامل",
      "en": "platform-neural-atlas"
    },
    "keywords": [
      "الاطلس",
      "العصبي",
      "الشامل",
      "platform-neural-atlas",
      "جميع",
      "مجموعات",
      "العمليات",
      "والسيدبار",
      "والانظمه",
      "المترابطه",
      "الحجوزات",
      "الرحلات",
      "الفنادق",
      "الخدمات",
      "المحتوي",
      "العملاء",
      "التسويق",
      "الوكلاء",
      "الاتمته",
      "الماليه",
      "b2b",
      "التكاملات"
    ],
    "capabilityRefs": [
      "service.catalog.read",
      "graph.children.read",
      "mcp.executor"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.02",
    "kind": "screen",
    "screenId": "02",
    "mapId": "screen.02",
    "labels": {
      "ar": "التوسع التراكمي والشاشة الكاملة",
      "en": "fullscreen-cumulative-expansion"
    },
    "keywords": [
      "التوسع",
      "التراكمي",
      "والشاشه",
      "الكامله",
      "fullscreen-cumulative-expansion",
      "اصول",
      "الشبكه",
      "والتفرع",
      "العميق",
      "l0",
      "->",
      "l1",
      "l2",
      "l3",
      "والتحريك",
      "الحي",
      "المنصه",
      "المجال",
      "الخدمه",
      "الاجراء",
      "التنفيذ",
      "الحدث",
      "المورد",
      "الرقابه"
    ],
    "capabilityRefs": [
      "graph.children.read",
      "workspace.state.persist"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.03",
    "kind": "screen",
    "screenId": "03",
    "mapId": "screen.03",
    "labels": {
      "ar": "الحجوزات والإلغاء والتقييمات",
      "en": "bookings-cancellations"
    },
    "keywords": [
      "الحجوزات",
      "والالغاء",
      "والتقييمات",
      "bookings-cancellations",
      "مسار",
      "الحجز",
      "والتحقق",
      "من",
      "التوافر",
      "مع",
      "شروط",
      "الغرامه",
      "والمراجعه",
      "المسبق",
      "التدقيق",
      "المالي",
      "تاكيد",
      "المورد",
      "الالغاء",
      "والسياسات",
      "التسويه",
      "والاسترداد",
      "تقييمات",
      "النزلاء",
      "الوكيل",
      "المشرف"
    ],
    "capabilityRefs": [
      "booking.read",
      "cancellation.preview",
      "booking.refund.execute",
      "reviews.moderate"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.04",
    "kind": "screen",
    "screenId": "04",
    "mapId": "screen.04",
    "labels": {
      "ar": "الرحلات وموزعو GDS والدوائر البرمجية",
      "en": "flights-gds-engineering"
    },
    "keywords": [
      "الرحلات",
      "وموزعو",
      "gds",
      "والدوائر",
      "البرمجيه",
      "flights-gds-engineering",
      "بوابات",
      "pkfare",
      "seeru",
      "biletbank",
      "travelport",
      "مع",
      "فاحص",
      "json",
      "وهوامش",
      "الربح",
      "ترافلبورت",
      "بكفير",
      "سيرو",
      "للطيران",
      "بيلتبنك",
      "محرك",
      "الهوامش",
      "اجهزه",
      "الاستشعار",
      "تذاكر",
      "مؤكده"
    ],
    "capabilityRefs": [
      "flights.gds.search",
      "flights.price.lock",
      "flights.pnr.issue",
      "mcp.liotrip-analytics.demand_report"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.05",
    "kind": "screen",
    "screenId": "05",
    "mapId": "screen.05",
    "labels": {
      "ar": "الفنادق وبنوك الأسرّة",
      "en": "hotels-bedbanks"
    },
    "keywords": [
      "الفنادق",
      "وبنوك",
      "الاسره",
      "hotels-bedbanks",
      "الربط",
      "مع",
      "بنوك",
      "العالميه",
      "وتوافر",
      "الغرف",
      "وهامش",
      "الربح",
      "الموحد",
      "ترافلبورت",
      "فنادق",
      "سيرو",
      "بوكون",
      "bokun",
      "ريت",
      "هوك",
      "ratehawk",
      "تركيا",
      "المميزه",
      "دبي",
      "vip",
      "تزامن",
      "الاسعار",
      "مخزون"
    ],
    "capabilityRefs": [
      "hotels.inventory.read",
      "hotels.rate.sync",
      "hotels.availability.check"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.06",
    "kind": "screen",
    "screenId": "06",
    "mapId": "screen.06",
    "labels": {
      "ar": "النقل والجولات والباقات والتأشيرات",
      "en": "mobility-tours-packages-visas"
    },
    "keywords": [
      "النقل",
      "والجولات",
      "والباقات",
      "والتاشيرات",
      "mobility-tours-packages-visas",
      "اسطول",
      "mercedes",
      "vito",
      "السياحيه",
      "والبرامج",
      "الشامله",
      "واجراءات",
      "التاشيرات",
      "مرسيدس",
      "فيتو",
      "برامج",
      "دبي",
      "جولات",
      "طرابزون",
      "واسطنبول",
      "اصدار",
      "تتبع",
      "السائقين",
      "تسعير",
      "المسارات",
      "اشعار",
      "العميل",
      "تاكيد",
      "الخدمه"
    ],
    "capabilityRefs": [
      "packages.itinerary.read",
      "transfers.dispatch",
      "visa.application.track"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.07",
    "kind": "screen",
    "screenId": "07",
    "mapId": "screen.07",
    "labels": {
      "ar": "محتوى الموقع والتطبيقات وتجربة العرض",
      "en": "cms-web-mobile"
    },
    "keywords": [
      "محتوي",
      "الموقع",
      "والتطبيقات",
      "وتجربه",
      "العرض",
      "cms-web-mobile",
      "اداره",
      "الهيرو،",
      "المعاينه",
      "المتعدده",
      "(ويب",
      "جوال",
      "pwa)،",
      "والاصدارات",
      "اللحظيه",
      "سلايدر",
      "الهيرو",
      "الرئيسي",
      "عروض",
      "الفنادق",
      "الترويجيه",
      "معاينه",
      "الجوال",
      "pwa",
      "مدونه",
      "لوناليزا",
      "الوسائط",
      "المترجم",
      "الذكي",
      "محرك",
      "التوليد",
      "النشر",
      "اللحظي"
    ],
    "capabilityRefs": [
      "cms.page.preview",
      "cms.content.publish",
      "mcp.liotrip-blog.research_draft",
      "mcp.liotrip-canva.create_design"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.08",
    "kind": "screen",
    "screenId": "08",
    "mapId": "screen.08",
    "labels": {
      "ar": "العملاء وخدمة العملاء والمحادثات الموحدة",
      "en": "customers-conversations"
    },
    "keywords": [
      "العملاء",
      "وخدمه",
      "والمحادثات",
      "الموحده",
      "customers-conversations",
      "سجل",
      "العميل",
      "360،",
      "خيط",
      "الشات",
      "الموحد",
      "مع",
      "واتساب،",
      "وتحليل",
      "مشاعر",
      "المحادثه",
      "ملف",
      "360",
      "محادثات",
      "واتساب",
      "السحابيه",
      "المباشر",
      "بالمنصه",
      "تحليل",
      "المشاعر",
      "والرضا",
      "الحجوزات",
      "السابقه",
      "نقاط",
      "الولاء",
      "المكتسبه",
      "تذكره",
      "دعم",
      "فني",
      "الردود",
      "الاليه",
      "للوكيل"
    ],
    "capabilityRefs": [
      "customers.conversations.read",
      "mcp.liotrip-whatsapp.send_text",
      "mcp.liotrip-whatsapp.send_template"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.09",
    "kind": "screen",
    "screenId": "09",
    "mapId": "screen.09",
    "labels": {
      "ar": "النشر متعدد القنوات والمحتوى واستوديو الفيديو",
      "en": "social-publishing-media"
    },
    "keywords": [
      "النشر",
      "متعدد",
      "القنوات",
      "والمحتوي",
      "واستوديو",
      "الفيديو",
      "social-publishing-media",
      "الجدول",
      "الاسبوعي،",
      "توليد",
      "الفيديوهات",
      "الذكيه",
      "عبر",
      "higgsfield",
      "heygen",
      "google",
      "flow",
      "والنشر",
      "الموحد",
      "جدول",
      "الاسبوعي",
      "ai",
      "فيديو",
      "الافاتار",
      "المتكلم",
      "ultra",
      "تصاميم",
      "canva",
      "connect",
      "انستغرام",
      "وتيك",
      "توك",
      "اكس",
      "وتليجرام",
      "محرك"
    ],
    "capabilityRefs": [
      "social.publish.schedule",
      "mcp.liotrip-higgsfield.generate_video",
      "mcp.liotrip-studio.generate_video",
      "mcp.liotrip-google-flow.generate_video",
      "mcp.liotrip-canva.create_design",
      "mcp.lonaliza-publish.posts"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.10",
    "kind": "screen",
    "screenId": "10",
    "mapId": "screen.10",
    "labels": {
      "ar": "الحملات والتسويق والعمولات ومسار النمو",
      "en": "ads-affiliates-growth"
    },
    "keywords": [
      "الحملات",
      "والتسويق",
      "والعمولات",
      "ومسار",
      "النمو",
      "ads-affiliates-growth",
      "مسار",
      "التحويل",
      "الاعلاني،",
      "اعلانات",
      "google",
      "meta،",
      "وبرنامج",
      "شركاء",
      "التسويق",
      "بالعموله",
      "funnel",
      "ads",
      "meta",
      "حملات",
      "click-to-whatsapp",
      "شبكه",
      "المسوقين",
      "حساب",
      "العائد",
      "roas",
      "اعاده",
      "الاستهداف",
      "الذكي",
      "تحسين",
      "الميزانيات"
    ],
    "capabilityRefs": [
      "ads.campaign.manage",
      "mcp.liotrip-ads.reports",
      "mcp.liotrip-ads.launch_targeted_campaign"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.11",
    "kind": "screen",
    "screenId": "11",
    "mapId": "screen.11",
    "labels": {
      "ar": "غرفة الوكلاء والمعرفة ومصفوفة أدوات MCP",
      "en": "agents-knowledge"
    },
    "keywords": [
      "غرفه",
      "الوكلاء",
      "والمعرفه",
      "ومصفوفه",
      "ادوات",
      "mcp",
      "agents-knowledge",
      "طاقم",
      "الـ",
      "16",
      "21",
      "خادم",
      "والـ",
      "88",
      "اداه",
      "تنفيذيه",
      "حيه",
      "الوكيل",
      "المشرف",
      "مستشار",
      "الرحلات",
      "مدير",
      "الاعلانات",
      "مهندس",
      "المحتوي",
      "خبير",
      "الطيران",
      "مفاوض",
      "الفنادق",
      "خوادم",
      "سجل",
      "التنفيذ",
      "الحي"
    ],
    "capabilityRefs": [
      "agent.swarm.dispatch",
      "mcp.executor.all",
      "mcp.lonaliza-platform-admin.audit_platform"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.12",
    "kind": "screen",
    "screenId": "12",
    "mapId": "screen.12",
    "labels": {
      "ar": "استوديو الأتمتة والتنفيذ ومسارات DAG",
      "en": "automation-workflows"
    },
    "keywords": [
      "استوديو",
      "الاتمته",
      "والتنفيذ",
      "ومسارات",
      "dag",
      "automation-workflows",
      "بناء",
      "مسارات",
      "العمل:",
      "المحفز",
      "->",
      "الشروط",
      "الاجراءات",
      "المتوازيه",
      "المهله",
      "والمسار",
      "البديل",
      "محفز",
      "الحدث",
      "فحص",
      "والسياسات",
      "التنفيذ",
      "المتوازي",
      "اشعار",
      "العملاء",
      "المزامنه",
      "مع",
      "المحاسبه",
      "المعالجه",
      "البديله",
      "fallback",
      "مؤقت",
      "سجل",
      "نجاح",
      "المسار"
    ],
    "capabilityRefs": [
      "automation.workflow.execute",
      "automation.workflow.pause",
      "automation.workflow.replay"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.13",
    "kind": "screen",
    "screenId": "13",
    "mapId": "screen.13",
    "labels": {
      "ar": "المالية والفوترة والتسوية ومحفظة B2B",
      "en": "finance-settlement"
    },
    "keywords": [
      "الماليه",
      "والفوتره",
      "والتسويه",
      "ومحفظه",
      "b2b",
      "finance-settlement",
      "دفتر",
      "الاستاذ",
      "المالي،",
      "بوابات",
      "الدفع",
      "الالكتروني،",
      "فواتير",
      "ضريبه",
      "القيمه",
      "المضافه،",
      "وتسويه",
      "الموردين",
      "سجل",
      "الفواتير",
      "الضريبيه",
      "(stripe/tabby)",
      "محفظه",
      "ودائع",
      "تسويه",
      "حسابات",
      "تصدير",
      "pdf",
      "معتمد",
      "تتبع",
      "العمولات",
      "مطابقه",
      "البنك",
      "التقرير",
      "المالي",
      "اليومي"
    ],
    "capabilityRefs": [
      "finance.invoice.approve",
      "finance.deposit.reconcile",
      "finance.vat.report"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.14",
    "kind": "screen",
    "screenId": "14",
    "mapId": "screen.14",
    "labels": {
      "ar": "إعادة البيع وشبكة B2B والعلامة البيضاء",
      "en": "b2b-reselling-whitelabel"
    },
    "keywords": [
      "اعاده",
      "البيع",
      "وشبكه",
      "b2b",
      "والعلامه",
      "البيضاء",
      "b2b-reselling-whitelabel",
      "اداره",
      "42",
      "وكاله",
      "شريكه،",
      "حدود",
      "الائتمان،",
      "رخص",
      "العلامه",
      "البيضاء،",
      "وحسابات",
      "الودائع",
      "ملف",
      "الوكاله",
      "الشريكه",
      "سقف",
      "الائتمان",
      "والديبوزيت",
      "white-label",
      "ربط",
      "نطاقات",
      "dns",
      "المخصصه",
      "بوابه",
      "التوزيع",
      "تخصيص",
      "هوامش",
      "الوكيل",
      "تقارير",
      "المبيعات",
      "الفرعيه",
      "تجديد",
      "العقود"
    ],
    "capabilityRefs": [
      "b2b.partner.dossier",
      "b2b.credit.adjust",
      "b2b.whitelabel.provision"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.15",
    "kind": "screen",
    "screenId": "15",
    "mapId": "screen.15",
    "labels": {
      "ar": "الامتثال والخصوصية والصلاحيات وأمن النظام",
      "en": "legal-privacy-security"
    },
    "keywords": [
      "الامتثال",
      "والخصوصيه",
      "والصلاحيات",
      "وامن",
      "النظام",
      "legal-privacy-security",
      "حمايه",
      "البيانات",
      "الشخصيه",
      "pdpl",
      "gdpr،",
      "مصفوفه",
      "الصلاحيات",
      "rbac،",
      "وسجل",
      "التدقيق",
      "المشفر",
      "امتثال",
      "نظام",
      "سياسات",
      "الخصوصيه",
      "والشروط",
      "صلاحيات",
      "rbac",
      "سجل",
      "مفتاح",
      "التشفير",
      "وسجلات",
      "التتبع",
      "مراقبه",
      "محاولات",
      "الدخول",
      "اشعار",
      "الانتهاكات",
      "الفوري",
      "شهادات",
      "الامان",
      "والامتثال"
    ],
    "capabilityRefs": [
      "legal.policy.audit",
      "security.rbac.verify",
      "security.audit_log.export"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.16",
    "kind": "screen",
    "screenId": "16",
    "mapId": "screen.16",
    "labels": {
      "ar": "الإعدادات والتكاملات وشبكة الخدمات الحية",
      "en": "settings-integrations"
    },
    "keywords": [
      "الاعدادات",
      "والتكاملات",
      "وشبكه",
      "الخدمات",
      "الحيه",
      "settings-integrations",
      "خوادم",
      "smtp،",
      "قواعد",
      "pocketbase،",
      "وسيط",
      "redis،",
      "وفحص",
      "استجابه",
      "كافه",
      "الـ",
      "microservices",
      "اعدادات",
      "smtp",
      "والبريد",
      "pocketbase",
      "المنفذ",
      "8090",
      "redis",
      "الرسائل",
      "خدمات",
      "pm2",
      "المترابطه",
      "مفاتيح",
      "openai",
      "gemini",
      "خادم",
      "mcp",
      "http",
      "فحص",
      "ping",
      "اللحظي",
      "سجل",
      "صحه",
      "الخوادم"
    ],
    "capabilityRefs": [
      "settings.smtp.test",
      "settings.api_keys.verify",
      "mcp.lonaliza-platform-admin.health_check"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.17",
    "kind": "screen",
    "screenId": "17",
    "mapId": "screen.17",
    "labels": {
      "ar": "القرص الصوتي وحالات الوكيل الست",
      "en": "supervisor-voice-states"
    },
    "keywords": [
      "القرص",
      "الصوتي",
      "وحالات",
      "الوكيل",
      "الست",
      "supervisor-voice-states",
      "التبديل",
      "بين",
      "الحالات",
      "الست:",
      "خمول،",
      "استماع،",
      "تفكير،",
      "كلام،",
      "تنفيذ،",
      "ومقاطعه",
      "مع",
      "موجه",
      "التردد",
      "1.",
      "الخمول",
      "(idle)",
      "2.",
      "الاستماع",
      "(listening)",
      "3.",
      "التفكير",
      "(deliberating)",
      "4.",
      "الكلام",
      "(speaking)",
      "5.",
      "التنفيذ",
      "(executing)",
      "6.",
      "المقاطعه",
      "(interrupted)"
    ],
    "capabilityRefs": [
      "voice.state.transition",
      "voice.synthesis.stream",
      "voice.duplex.lock"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.18",
    "kind": "screen",
    "screenId": "18",
    "mapId": "screen.18",
    "labels": {
      "ar": "حالات النوافذ والسيدبار والتنقل ومختبر المساحات",
      "en": "workspace-interaction-states"
    },
    "keywords": [
      "حالات",
      "النوافذ",
      "والسيدبار",
      "والتنقل",
      "ومختبر",
      "المساحات",
      "workspace-interaction-states",
      "العائمه",
      "القابله",
      "للسحب",
      "والتحجيم",
      "والتصغير،",
      "شريط",
      "المهام",
      "السفلي،",
      "وذاكره",
      "الترتيب",
      "نافذه",
      "فاحص",
      "العقده",
      "مسار",
      "التشغيل",
      "الشريط",
      "الجانبي",
      "العائم",
      "dock",
      "السفلي",
      "ازرار",
      "التحكم",
      "والتثبيت",
      "مقابض",
      "التحجيم",
      "التفاعليه",
      "ذاكره",
      "المحليه",
      "شاشه",
      "كامله",
      "غامره"
    ],
    "capabilityRefs": [
      "workspace.state.persist",
      "workspace.panels.restore",
      "workspace.layout.reset"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.19",
    "kind": "screen",
    "screenId": "19",
    "mapId": "screen.19",
    "labels": {
      "ar": "القيادة التنفيذية والعناقيد السداسية",
      "en": "executive-command-hexagonal"
    },
    "keywords": [
      "القياده",
      "التنفيذيه",
      "والعناقيد",
      "السداسيه",
      "executive-command-hexagonal",
      "العناقيد",
      "السته،",
      "مؤشرات",
      "الاداء",
      "الحيه،",
      "الرسوم",
      "البيانيه",
      "اللحظيه،",
      "وتدفق",
      "الاحداث",
      "عنقود",
      "الايرادات",
      "$307k",
      "الحجوزات",
      "38",
      "الموردين",
      "100%",
      "الوكلاء",
      "99.4%",
      "الاعلانات",
      "4.8x",
      "b2b",
      "التوريد",
      "$1.4m",
      "شريط",
      "اللحظي",
      "منحنيات",
      "الـ",
      "24",
      "ساعه"
    ],
    "capabilityRefs": [
      "metrics.executive.read",
      "mcp.lonaliza-platform-admin.get_executive_metrics"
    ],
    "defaultIntent": "briefing",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.20",
    "kind": "screen",
    "screenId": "20",
    "mapId": "screen.20",
    "labels": {
      "ar": "الحضور البشري والصوت الحي",
      "en": "jarvis-humanoid-presence"
    },
    "keywords": [
      "الحضور",
      "البشري",
      "والصوت",
      "الحي",
      "jarvis-humanoid-presence",
      "منصه",
      "التفاعل",
      "الطبيعي",
      "والذكاء",
      "المساعد",
      "راس",
      "الافاتار",
      "والعيون",
      "النواه",
      "الصدريه",
      "الكهرمانيه",
      "الالياف",
      "العصبيه",
      "المضيئه",
      "حقل",
      "التاج",
      "الجزيئي",
      "جبال",
      "البيانات",
      "الخلفيه",
      "الميكروفون",
      "الصوتي",
      "تلقي",
      "الاوامر",
      "السيبرانيه",
      "التنفيذ",
      "الفوري",
      "المباشر"
    ],
    "capabilityRefs": [
      "presence.humanoid.stream",
      "voice.synthesis.stream",
      "mcp.executor.dispatch"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.21",
    "kind": "screen",
    "screenId": "21",
    "mapId": "screen.21",
    "labels": {
      "ar": "مسرح Nexus — سلايد البطاقات الهولوغرافية",
      "en": "nexus-orbital-deck"
    },
    "keywords": [
      "مسرح",
      "nexus",
      "سلايد",
      "البطاقات",
      "الهولوغرافيه",
      "nexus-orbital-deck",
      "كل",
      "اقسام",
      "المنصه",
      "علي",
      "اسطوانه",
      "3d",
      "ماوس",
      "لمس",
      "كاميرا/يد",
      "اعدادات",
      "سيبرانيه",
      "orbital",
      "deck",
      "بطاقات",
      "الاقسام",
      "تعقب",
      "اليد",
      "احصائيات",
      "حيه",
      "نوافذ",
      "الاعدادات"
    ],
    "capabilityRefs": [
      "studio.navigate",
      "nexus.rotate",
      "nexus.select_sector",
      "nexus.run_sector_command"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "screen.22",
    "kind": "screen",
    "screenId": "22",
    "mapId": "screen.22",
    "labels": {
      "ar": "استوديو العقد والأتمتة السيبرانية",
      "en": "visual-loops-automation-studio"
    },
    "keywords": [
      "استوديو",
      "العقد",
      "والاتمته",
      "السيبرانيه",
      "visual-loops-automation-studio",
      "interactive",
      "visual",
      "loops",
      "سحب",
      "وربط",
      "تشغيل",
      "تنفيذي",
      "حقيقي",
      "بوابه",
      "مفاتيح",
      "api",
      "trigger",
      "rag",
      "model",
      "skill",
      "rule",
      "action",
      "review"
    ],
    "capabilityRefs": [
      "loops.run",
      "loops.run_node",
      "loops.select_sector",
      "mcp.executor"
    ],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "screensData.ts"
  },
  {
    "id": "ui.agents.hide",
    "kind": "ui_action",
    "screenId": "18",
    "labels": {
      "ar": "إخفاء الوكلاء"
    },
    "keywords": [
      "اخفاء",
      "الوكلاء",
      "hide",
      "agents"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "gen-platform-index.cjs"
  },
  {
    "id": "ui.briefing.open",
    "kind": "ui_action",
    "screenId": "19",
    "labels": {
      "ar": "تقرير جاهزية"
    },
    "keywords": [
      "تقرير",
      "جاهزيه",
      "ثغرات",
      "خوادم",
      "مفعله"
    ],
    "capabilityRefs": [
      "briefing.readiness"
    ],
    "defaultIntent": "briefing",
    "risk": "low",
    "evidence": "gen-platform-index.cjs"
  },
  {
    "id": "ui.swarm.layout",
    "kind": "ui_action",
    "screenId": "18",
    "labels": {
      "ar": "تنسيق جماعي"
    },
    "keywords": [
      "تنسيق",
      "جماعي",
      "swarm",
      "layout"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "gen-platform-index.cjs"
  },
  {
    "id": "ui.voice.mute",
    "kind": "ui_action",
    "screenId": "17",
    "labels": {
      "ar": "كتم الصوت"
    },
    "keywords": [
      "كتم",
      "الصوت",
      "mute"
    ],
    "capabilityRefs": [],
    "defaultIntent": "navigate",
    "risk": "low",
    "evidence": "gen-platform-index.cjs"
  }
] as PlatformIndexNode[];

export const PLATFORM_INDEX_BY_ID: Record<string, PlatformIndexNode> = Object.fromEntries(PLATFORM_INDEX_NODES.map((n) => [n.id, n]));

export const PLATFORM_INDEX_GENERATED_AT = "2026-09-30T19:26:04.606Z";
