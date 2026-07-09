import type { ToolAccessLevel } from '../types.js';

export function buildToolMeta(access: ToolAccessLevel, extra: Record<string, unknown> = {}) {
  return {
    ...extra,
    safetechAccess: access,
  };
}
