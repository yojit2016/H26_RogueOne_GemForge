/**
 * Development-only fixtures for GemForge dashboard.
 * Contains the authentic LinkWatch Phase 3 regression verification capsule.
 * Clearly designated and never silently substituted for live API results.
 */

import type { ExitCapsule } from "@/types/gemforge"
import rawLinkwatchCapsule from "@/fixtures/linkwatchCapsule.json"

export const IS_DEMO_FIXTURES_ENABLED = import.meta.env.DEV

export const LINKWATCH_DEMO_CAPSULE = rawLinkwatchCapsule as unknown as ExitCapsule

export interface DemoFixtureMetadata {
  id: string
  name: string
  description: string
  capsule: ExitCapsule
  isDemo: true
}

export const AVAILABLE_DEMO_FIXTURES: DemoFixtureMetadata[] = [
  {
    id: "demo-linkwatch-phase3",
    name: "LinkWatch (Phase 3 Verified Regression)",
    description: "Authentic multi-manifest Python project with pydantic v1 vs v2 conflict, Gemma 4 migration proposal, and isolated venv verification showing regression on custom model probes.",
    capsule: LINKWATCH_DEMO_CAPSULE,
    isDemo: true,
  },
]
