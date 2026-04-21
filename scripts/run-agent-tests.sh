#!/usr/bin/env bash
# Open Engineer Agent Test Harness
# Runs all 12 agent test cases and generates a coverage report.
# Requires: opencode installed, openengineer plugin loaded, NEBIUS_API_KEY set.
set -euo pipefail

TRACE_FILE="${HOME}/.local/share/opencode/storage/openengineer/agent-trace.jsonl"
REPORT_FILE="${PWD}/agent-test-report.md"
PASS=0
FAIL=0
SKIP=0

echo "# Open Engineer Agent Test Harness"
echo "Starting at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Clear previous trace
> "$TRACE_FILE" 2>/dev/null || true

run_test() {
  local test_num="$1"
  local test_name="$2"
  local prompt="$3"
  local expected_agent="$4"

  echo -n "  [$test_num/12] $test_name... "

  if opencode run "$prompt" --json >/dev/null 2>&1; then
    echo "OK"
    PASS=$((PASS + 1))
  else
    echo "FAILED (exit code $?)"
    FAIL=$((FAIL + 1))
  fi
}

echo "## Running Tests"
echo ""

# Test 1: analyst
run_test 1 "direct-analyst" \
  "@analyst list all files matching *.ts in the src/hooks directory" \
  "analyst"

# Test 2: librarian
run_test 2 "direct-librarian" \
  "@librarian how does the zod library's z.object() method work? Keep it brief." \
  "librarian"

# Test 3: researcher
run_test 3 "direct-researcher" \
  "@researcher what are the top 3 open-source vector databases in 2026? One paragraph." \
  "researcher"

# Test 4: strategist
run_test 4 "direct-strategist" \
  "@strategist in one paragraph, what are the key tradeoffs between SQLite and PostgreSQL for a local-first app?" \
  "strategist"

# Test 5: consultant
run_test 5 "direct-consultant" \
  "@consultant in one paragraph, what are the risks of storing API keys in environment variables?" \
  "consultant"

# Test 6: junior-architect
run_test 6 "direct-junior-architect" \
  "@junior-architect write a TypeScript function called debounce that takes a callback and delay in ms" \
  "junior-architect"

# Test 7: engineer
run_test 7 "direct-engineer" \
  "@engineer write a complete TypeScript function that reads a JSONL file and returns parsed objects" \
  "engineer"

# Test 8: product-manager
run_test 8 "direct-product-manager" \
  "@plan add a health check endpoint that returns {status: ok}" \
  "product-manager"

# Test 9: qa-engineer
run_test 9 "direct-qa-engineer" \
  "@qa-engineer review this plan: 1. Add GET /health route. 2. Return 200 with {status: ok}. 3. Add integration test." \
  "qa-engineer"

# Test 10: technical-lead
run_test 10 "direct-technical-lead" \
  "@technical-lead break this into 3 subtasks: add structured logging to all API endpoints" \
  "technical-lead"

# Test 11: designer (vision) — skip if no screenshot available
if [[ -f "./README.md" ]]; then
  run_test 11 "direct-designer" \
    "@designer describe the structure and content of the README.md file in this project" \
    "designer"
else
  echo "  [11/12] direct-designer... SKIPPED (no README.md for vision test)"
  SKIP=$((SKIP + 1))
fi

# Test 12: architect (orchestrated)
run_test 12 "orchestrated-architect" \
  "find all files larger than 5KB in the src/ directory and list them with their sizes" \
  "architect"

echo ""
echo "## Results"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "  Skipped: $SKIP"
echo ""

# Generate report from trace file
echo "## Agent Trace Report"
echo ""

if [[ -f "$TRACE_FILE" ]] && [[ -s "$TRACE_FILE" ]]; then
  echo "| Agent | Model | Tokens In | Tokens Out | Cost |"
  echo "|-------|-------|-----------|------------|------|"

  # Parse JSONL and summarize by agent
  python3 -c "
import json, sys
from collections import defaultdict

agents = defaultdict(lambda: {'model': '', 'input': 0, 'output': 0, 'cost': 0.0, 'count': 0})

with open('$TRACE_FILE') as f:
    for line in f:
        if not line.strip():
            continue
        entry = json.loads(line)
        agent = entry.get('agent', 'unknown')
        agents[agent]['model'] = entry.get('modelId', '')
        agents[agent]['input'] += entry.get('inputTokens', 0)
        agents[agent]['output'] += entry.get('outputTokens', 0)
        agents[agent]['cost'] += entry.get('costUsd', 0)
        agents[agent]['count'] += 1

total_cost = 0
invoked = set()
for agent in sorted(agents.keys()):
    d = agents[agent]
    model_short = d['model'].replace('nebius/', '').split('/')[-1] if d['model'] else '?'
    cost_str = f'\${d[\"cost\"]:.4f}'
    print(f'| {agent} | {model_short} | {d[\"input\"]:,} | {d[\"output\"]:,} | {cost_str} |')
    total_cost += d['cost']
    invoked.add(agent)

all_agents = {'architect','engineer','strategist','librarian','researcher','analyst','designer','product-manager','consultant','qa-engineer','technical-lead','junior-architect'}
missing = all_agents - invoked
coverage = len(invoked & all_agents)

print()
print(f'## Coverage')
print(f'Agents invoked: {coverage}/12' + (' ✓' if coverage == 12 else ''))
if missing:
    print(f'Missing: {\", \".join(sorted(missing))}')
print()
print(f'## Total Cost')
print(f'\${total_cost:.4f}')
" 2>/dev/null || echo "(python3 not available for report parsing)"
else
  echo "No trace data found at $TRACE_FILE"
  echo "Ensure openengineer plugin is loaded and NEBIUS_API_KEY is set."
fi

echo ""
echo "---"
echo "Test run completed at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
