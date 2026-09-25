/**
 * Server-side release flags — synthetic demonstration only.
 *
 * Ported from the Sprint 0 build (src/lib/config.ts), adapted to this build's
 * style: compile-time constants that can NEVER be enabled by client input or
 * by environment configuration in this demo. Enabling either flag requires
 * documented gate evidence and accountable human sign-off.
 *
 * PHI_PRODUCTION_ENABLED re-exports the compile-time lock from './governance'
 * (the single source of truth; do not redefine it here).
 *
 * Guardrails: keep real patient health information disabled until formally
 * approved. Keep real payments disabled until formally approved. Synthetic
 * demo data only.
 */
import { PHI_PRODUCTION_ENABLED } from './governance';

export { PHI_PRODUCTION_ENABLED };

/** Real payments are disabled in this demonstration. */
export const PAYMENTS_ENABLED = false as const;

/** Emergency references — informational only, never gated (brief §8). */
export const EMERGENCY = {
  policeFireAmbulance: '911',
  healthLineSK: '811',
  crisisHelpline: '9-8-8',
} as const;
