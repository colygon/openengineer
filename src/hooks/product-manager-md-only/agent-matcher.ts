import { PRODUCT_MANAGER_AGENT } from "./constants"

export function isProductManagerAgent(agentName: string | undefined): boolean {
  return agentName?.toLowerCase().includes(PRODUCT_MANAGER_AGENT) ?? false
}
