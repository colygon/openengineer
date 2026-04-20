# Open Engineer

A batteries-included multi-model AI agent team for OpenCode. 12 specialized agents, each powered by the best open-source model from a different AI lab.

Forked from [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) by code-yeongyu.

## Agents

One agent per model maker. No duplicates.

| Agent | Primary Model | Maker | Role |
|-------|---------------|-------|------|
| architect | Qwen3 Coder 480B | Qwen | Main orchestrator |
| engineer | GPT-OSS 120B | OpenAI | Autonomous deep worker |
| strategist | DeepSeek R1 | DeepSeek | Deep reasoning |
| librarian | MiniMax M2.5 | MiniMax | OSS code & docs search |
| researcher | Nemotron Ultra 253B | NVIDIA | Broad knowledge synthesis |
| analyst | Gemma 3 27B | Google | Fast codebase exploration |
| designer | Qwen2.5 VL 72B | Qwen* | Visual/UI tasks |
| product-manager | Kimi K2.5 | Moonshot | Strategic planning |
| consultant | GLM-5 | Z.ai | Architecture advisor |
| qa-engineer | Hermes 4 405B | NousResearch | Plan reviewer |
| technical-lead | Llama 3.3 70B | Meta | Plan executor |
| junior-architect | INTELLECT-3 | PrimeIntellect | Lighter coding tasks |

*Qwen2.5 VL 72B is the only vision-capable model available — retained for designer.

## Categories

| Category | Primary Model | Use |
|----------|---------------|-----|
| visual-engineering | Qwen2.5 VL 72B | Frontend, UI, design |
| ultrabrain | DeepSeek R1 | Hard logic-heavy tasks |
| deep | Kimi K2.5 | Autonomous problem-solving |
| artistry | Nemotron Ultra 253B | Creative approaches |
| quick | Gemma 3 27B | Trivial tasks |
| unspecified-low | Llama 3.3 70B | Moderate unclassified tasks |
| unspecified-high | Qwen 3.5 397B | High-effort unclassified tasks |
| writing | INTELLECT-3 | Documentation and prose |

## Features

- **12 Specialized Agents** — one per AI lab
- **Cross-Session Memory** — persistent facts via [mem0](https://github.com/mem0ai/mem0) (local, no cloud)
- **Cost Tracking** — real-time per-session and lifetime cost in USD
- **ZSH Shell Plugin** — invoke agents from terminal with `:` prefix
- **All Open Source** — no proprietary model lock-in

## Installation

```bash
npm install openengineer
```

Add to `opencode.json`:

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

```bash
export NEBIUS_API_KEY="your-key"
```

## Shell Plugin

```bash
./shell-plugin/install.sh

: fix the login bug
:strategist should we use Redis or Memcached?
:researcher what are the best approaches for distributed caching?
:plan migrate the database
```

## License

See [LICENSE.md](./LICENSE.md).
