# Open Engineer

A batteries-included multi-model AI agent team for OpenCode, powered by open-source models via Nebius Token Factory.

Forked from [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) by code-yeongyu.

## Features

- **10 Specialized Agents** with distinct models optimized per role
- **12 Model Makers** — Qwen, DeepSeek, Kimi, GLM, Hermes, GPT-OSS, NVIDIA, Google, Meta, MiniMax, PrimeIntellect, NousResearch
- **8 Task Categories** — visual-engineering, ultrabrain, deep, artistry, quick, unspecified-low, unspecified-high, writing
- **Cross-Session Memory** — persistent facts and decisions via [mem0](https://github.com/mem0ai/mem0)
- **Cost Tracking** — real-time per-session and lifetime cost in USD
- **ZSH Shell Plugin** — invoke agents directly from your terminal with `:` prefix
- **All Open Source** — no proprietary model lock-in

## Agents

| Agent | Primary Model | Role |
|-------|---------------|------|
| architect | Qwen3 Coder 480B | Main orchestrator |
| engineer | DeepSeek V3.2 | Autonomous deep worker |
| strategist | DeepSeek R1 | Deep reasoning |
| analyst | GPT-OSS 20B | Fast exploration |
| designer | Qwen2.5 VL 72B | Visual/UI tasks |
| product-manager | Kimi K2.5 | Strategic planning |
| consultant | GLM-5 | Architecture advisor |
| qa-engineer | Hermes 4 405B | Plan reviewer |
| technical-lead | Kimi K2-Instruct | Plan executor |
| junior-architect | GPT-OSS 120B | Lighter coding tasks |

## Installation

```bash
npm install openengineer
```

Add to your `opencode.json`:

```json
{
  "plugin": ["openengineer"],
  "model": "nebius/deepseek-ai/DeepSeek-V3.2",
  "provider": {
    "nebius": {
      "name": "Nebius Token Factory",
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "https://api.tokenfactory.us-central1.nebius.com/v1"
      }
    }
  }
}
```

Set your API key:

```bash
export NEBIUS_API_KEY="your-key"
```

## Shell Plugin

Invoke agents directly from your terminal:

```bash
# Install
./shell-plugin/install.sh

# Usage
: fix the login bug
:strategist should we use Redis or Memcached?
:plan migrate the database
:help
```

## Memory

Agents accumulate knowledge across sessions:

```
remember that we use Bun for this project
remember search project tooling
```

Powered by [mem0](https://github.com/mem0ai/mem0) in local/OSS mode — no external service required.

## Configuration

Create `~/.config/opencode/openengineer.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/colygon/openengineer/dev/assets/openengineer.schema.json"
}
```

## License

See [LICENSE.md](./LICENSE.md).
