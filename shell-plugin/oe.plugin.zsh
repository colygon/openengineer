# Open Engineer ZSH Plugin
# Usage: source this file in your .zshrc or use with a ZSH plugin manager
#
# Commands:
#   : <prompt>          Send a prompt to the active agent
#   :architect <prompt> Send to the architect agent
#   :strategist <prompt> Send to the strategist agent
#   :analyst <prompt>   Send to the analyst (fast exploration)
#   :engineer <prompt>  Send to the engineer agent
#   :plan <prompt>      Start a planning session
#   :conv               Browse saved conversations (requires fzf)
#   :models             List available models
#   :doctor             Run diagnostics
#   :help               Show available commands

# Ensure opencode is available
if ! command -v opencode &>/dev/null; then
  echo "[oe] Warning: opencode not found in PATH. Install it: npm install -g opencode"
  return 1
fi

# Agent names that can be invoked directly
typeset -gA _OE_AGENTS=(
  [architect]=1
  [engineer]=1
  [strategist]=1
  [analyst]=1
  [designer]=1
  [product-manager]=1
  [consultant]=1
  [qa-engineer]=1
  [technical-lead]=1
  [junior-architect]=1
  [librarian]=1
)

# The main `:` command handler
function _oe_colon_command() {
  local input="$*"

  # Empty input — launch interactive TUI
  if [[ -z "$input" ]]; then
    opencode
    return $?
  fi

  # Check if first word is an agent name
  local first_word="${input%% *}"
  local rest="${input#* }"

  case "$first_word" in
    help)
      _oe_help
      return 0
      ;;
    conv|conversations)
      _oe_browse_conversations
      return $?
      ;;
    models)
      opencode models 2>/dev/null || echo "[oe] Failed to list models"
      return $?
      ;;
    doctor)
      opencode debug config 2>/dev/null | head -30
      return $?
      ;;
    plan)
      if [[ "$rest" == "$first_word" ]]; then
        echo "[oe] Usage: :plan <description>"
        return 1
      fi
      opencode run "@plan $rest"
      return $?
      ;;
    *)
      # Check if it's an agent name
      if (( ${+_OE_AGENTS[$first_word]} )); then
        if [[ "$rest" == "$first_word" ]]; then
          echo "[oe] Usage: :$first_word <prompt>"
          return 1
        fi
        opencode run "@$first_word $rest"
        return $?
      fi

      # Default: send to the active agent
      opencode run "$input"
      return $?
      ;;
  esac
}

# Browse conversations with fzf (if available)
function _oe_browse_conversations() {
  if ! command -v fzf &>/dev/null; then
    echo "[oe] fzf not found. Install it: brew install fzf"
    echo "[oe] Falling back to listing recent sessions..."
    opencode debug scrap 2>/dev/null | tail -20
    return 1
  fi

  local sessions
  sessions=$(opencode debug scrap 2>/dev/null)
  if [[ -z "$sessions" ]]; then
    echo "[oe] No saved conversations found."
    return 0
  fi

  echo "$sessions" | fzf --height=40% --reverse --header="Select a conversation"
}

# Help text
function _oe_help() {
  cat <<'HELP'
Open Engineer Shell Plugin

Usage:
  : <prompt>              Send prompt to active agent
  :architect <prompt>     Send to architect (orchestrator)
  :engineer <prompt>      Send to engineer (deep worker)
  :strategist <prompt>    Send to strategist (reasoning)
  :analyst <prompt>       Send to analyst (fast exploration)
  :designer <prompt>      Send to designer (visual/UI)
  :consultant <prompt>    Send to consultant (architecture)
  :plan <prompt>          Start planning mode
  :conv                   Browse saved conversations
  :models                 List available models
  :doctor                 Run diagnostics
  :help                   Show this help

All agents: architect, engineer, strategist, analyst, designer,
  product-manager, consultant, qa-engineer, technical-lead,
  junior-architect, librarian

Examples:
  : fix the login bug
  :strategist should we use Redis or Memcached?
  :analyst find all API endpoints
  :plan migrate from REST to GraphQL
HELP
}

# Register the `:` command
# This uses ZSH's command_not_found_handler to intercept `:` prefixed commands
# without conflicting with the shell's built-in `:` (no-op) command

# Save the original handler if one exists
if (( ${+functions[command_not_found_handler]} )); then
  functions[_oe_original_cnf_handler]=$functions[command_not_found_handler]
fi

function command_not_found_handler() {
  local cmd="$1"
  shift

  # Check if command starts with a colon-prefixed agent name or is just ':'
  if [[ "$cmd" == :* ]]; then
    local stripped="${cmd#:}"
    _oe_colon_command "$stripped" "$@"
    return $?
  fi

  # Fall through to original handler if it exists
  if (( ${+functions[_oe_original_cnf_handler]} )); then
    _oe_original_cnf_handler "$cmd" "$@"
    return $?
  fi

  # Default: print error
  echo "zsh: command not found: $cmd" >&2
  return 127
}

# Also register direct aliases for common patterns
alias ':oe'='_oe_colon_command'

# Completion for agent names after `:`
function _oe_complete() {
  local -a agents=(
    'architect:Main orchestrator - plans and delegates'
    'engineer:Autonomous deep worker'
    'strategist:Deep reasoning and architecture'
    'analyst:Fast codebase exploration'
    'designer:Visual and UI tasks'
    'product-manager:Strategic planning'
    'consultant:Architecture advisor'
    'qa-engineer:Plan reviewer'
    'technical-lead:Plan executor'
    'junior-architect:Lighter coding tasks'
    'librarian:Documentation search'
    'plan:Start planning mode'
    'conv:Browse conversations'
    'models:List available models'
    'doctor:Run diagnostics'
    'help:Show help'
  )
  _describe 'oe command' agents
}

(( ${+functions[compdef]} )) && compdef _oe_complete _oe_colon_command

echo "[oe] Open Engineer shell plugin loaded. Type :help for usage."
