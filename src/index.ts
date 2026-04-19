import { initConfigContext } from "./cli/config-manager/config-context"
import type { Plugin } from "@opencode-ai/plugin"

import type { HookName } from "./config"

import { createHooks } from "./create-hooks"
import { createManagers } from "./create-managers"
import { createRuntimeTmuxConfig, isTmuxIntegrationEnabled } from "./create-runtime-tmux-config"
import { createTools } from "./create-tools"
import { initializeOpenClaw } from "./openclaw"
import { createPluginInterface } from "./plugin-interface"
import { createPluginDispose, type PluginDispose } from "./plugin-dispose"

import { loadPluginConfig } from "./plugin-config"
import { createModelCacheState } from "./plugin-state"
import { createFirstMessageVariantGate } from "./shared/first-message-variant"
import { injectServerAuthIntoClient, log, logLegacyPluginStartupWarning } from "./shared"
import { detectExternalSkillPlugin, getSkillPluginConflictWarning } from "./shared/external-plugin-detector"
import { startBackgroundCheck as startTmuxCheck } from "./tools/interactive-bash"
import { lspManager } from "./tools/lsp/client"
import { createPluginPostHog, getPostHogDistinctId } from "./shared/posthog"
import { initializeMemory } from "./features/session-memory"
import { createCostTrackingHook } from "./hooks/cost-tracking-hook"
import { getOpenCodeStorageDir } from "./shared/data-path"
import { join } from "node:path"
import { mkdirSync } from "node:fs"

let activePluginDispose: PluginDispose | null = null

const OpenEngineerPlugin: Plugin = async (ctx) => {
  initConfigContext("opencode", null)
  log("[OpenEngineerPlugin] ENTRY - plugin loading", {
    directory: ctx.directory,
  })
  logLegacyPluginStartupWarning()

  const skillPluginCheck = detectExternalSkillPlugin(ctx.directory)
  if (skillPluginCheck.detected && skillPluginCheck.pluginName) {
    console.warn(getSkillPluginConflictWarning(skillPluginCheck.pluginName))
  }

  injectServerAuthIntoClient(ctx.client)
  await activePluginDispose?.()

  const pluginConfig = loadPluginConfig(ctx.directory, ctx)

  const posthog = createPluginPostHog()
  const distinctId = getPostHogDistinctId()
  try {
    posthog.trackActive(distinctId, "plugin_loaded")
  } catch {
    // telemetry failure is non-fatal, silently ignore
  }
  try {
    posthog.capture({
      distinctId,
      event: "plugin_loaded",
      properties: {
        entry_point: "plugin",
        has_openclaw: !!pluginConfig.openclaw,
        tmux_enabled: isTmuxIntegrationEnabled(pluginConfig),
      },
    })
  } catch {
    // telemetry failure is non-fatal, silently ignore
  }
  if (pluginConfig.openclaw) {
    await initializeOpenClaw(pluginConfig.openclaw)
  }
  const tmuxIntegrationEnabled = isTmuxIntegrationEnabled(pluginConfig)
  if (tmuxIntegrationEnabled) {
    startTmuxCheck()
  }
  const disabledHooks = new Set(pluginConfig.disabled_hooks ?? [])

  const isHookEnabled = (hookName: HookName): boolean => !disabledHooks.has(hookName)
  const safeHookEnabled = pluginConfig.experimental?.safe_hook_creation ?? true

  const firstMessageVariantGate = createFirstMessageVariantGate()

  const tmuxConfig = createRuntimeTmuxConfig(pluginConfig)

  const modelCacheState = createModelCacheState()

  const managers = createManagers({
    ctx,
    pluginConfig,
    tmuxConfig,
    modelCacheState,
    backgroundNotificationHookEnabled: isHookEnabled("background-notification"),
  })

  const toolsResult = await createTools({
    ctx,
    pluginConfig,
    managers,
  })

  const hooks = createHooks({
    ctx,
    pluginConfig,
    modelCacheState,
    backgroundManager: managers.backgroundManager,
    isHookEnabled,
    safeHookEnabled,
    mergedSkills: toolsResult.mergedSkills,
    availableSkills: toolsResult.availableSkills,
  })

  const dispose = createPluginDispose({
    backgroundManager: managers.backgroundManager,
    skillMcpManager: managers.skillMcpManager,
    lspManager,
    disposeHooks: hooks.disposeHooks,
  })

  // Initialize cost tracking
  const oeStorageDir = join(getOpenCodeStorageDir(), "openengineer")
  try { mkdirSync(oeStorageDir, { recursive: true }) } catch {}
  const costHook = createCostTrackingHook(oeStorageDir)

  // Initialize cross-session memory (non-blocking)
  const memoryConfig = (pluginConfig as Record<string, unknown>).memory as Record<string, unknown> | undefined
  initializeMemory(memoryConfig ?? {}, oeStorageDir).catch((err) => {
    log("[session-memory] Background init failed", { error: err })
  })

  const pluginInterface = createPluginInterface({
    ctx,
    pluginConfig,
    firstMessageVariantGate,
    managers,
    hooks,
    tools: toolsResult.filteredTools,
  })

  activePluginDispose = dispose

  // Wrap event handler to also feed cost tracker
  const originalEvent = pluginInterface.event
  const wrappedEvent = async (input: { event: { type: string; properties?: unknown } }) => {
    await originalEvent?.(input as any)
    await costHook.event(input)
  }

  return {
    name: "open-engineer",
    ...pluginInterface,
    event: wrappedEvent as typeof pluginInterface.event,

    "experimental.session.compacting": async (
      _input: { sessionID: string },
      output: { context: string[] },
    ): Promise<void> => {
      await hooks.compactionContextInjector?.capture(_input.sessionID)
      await hooks.compactionTodoPreserver?.capture(_input.sessionID)
      await hooks.claudeCodeHooks?.["experimental.session.compacting"]?.(
        _input,
        output,
      )
      if (hooks.compactionContextInjector) {
        output.context.push(hooks.compactionContextInjector.inject(_input.sessionID))
      }
      // Add cost summary to compaction context
      const costSummary = costHook.tracker.getCostSummary(_input.sessionID)
      output.context.push(`[Cost: ${costSummary}]`)
    },
  }
}

export default OpenEngineerPlugin

export type {
  OpenEngineerConfig,
  AgentName,
  AgentOverrideConfig,
  AgentOverrides,
  McpName,
  HookName,
  BuiltinCommandName,
} from "./config"

export type { ConfigLoadError } from "./shared/config-errors"
