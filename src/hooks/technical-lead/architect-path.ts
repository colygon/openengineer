/**
 * Cross-platform check if a path is inside .openengineer/ directory.
 * Handles both forward slashes (Unix) and backslashes (Windows).
 * Uses path segment matching (not substring) to avoid false positives like "not-architect/file.txt"
 */
export function isArchitectPath(filePath: string): boolean {
  return /\.openengineer[/\\]/.test(filePath)
}
