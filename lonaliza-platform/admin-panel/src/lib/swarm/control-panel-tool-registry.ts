export type { PlatformSystemRow as ControlPanelToolRow, PlatformSystemStatus, PlatformToolExecuteResult } from "@/lib/swarm/platform-systems-registry";
export {
  inspectControlPanelTools,
  inspectPlatformSystems,
  platformToolIdForDirective,
  executeControlPanelTool,
  shouldProbeExecuteDirective,
  taskTypeForSystemId,
} from "@/lib/swarm/platform-systems-registry";
