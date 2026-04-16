# Open Engineer

A diverse multi-model AI agent team plugin for OpenCode, powered by open-source models via Nebius Token Factory.

Forked from [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) by code-yeongyu.

## Agents

| Agent | Primary Model |
|-------|---------------|
| architect | Qwen3 Coder 480B |
| engineer | DeepSeek V3.2 |
| strategist | DeepSeek R1 |
| analyst | GPT-OSS 20B |
| designer | Qwen2.5 VL 72B |
| product-manager | Kimi K2.5 |
| consultant | GLM-5 |
| qa-engineer | Hermes 4 405B |
| technical-lead | Kimi K2-Instruct |
| junior-architect | GPT-OSS 120B |

## Categories

| Category | Primary Model |
|----------|---------------|
| visual-engineering | Qwen2.5 VL 72B |
| ultrabrain | DeepSeek R1 |
| deep | Kimi K2.5 |
| artistry | Nemotron Ultra 253B |
| quick | Gemma 3 27B |
| unspecified-low | Llama 3.3 70B |
| unspecified-high | Qwen 3.5 397B |
| writing | INTELLECT-3 |

## Installation

```bash
npm install openengineer
```

Or add `"openengineer"` to your `opencode.json` plugin list:

```json
{
  "plugins": ["openengineer"]
}
```

## Configuration

Add a `$schema` reference for editor autocompletion:

```json
{
  "$schema": "https://raw.githubusercontent.com/colygon/openengineer/dev/assets/openengineer.schema.json"
}
```

## License

See [LICENSE.md](./LICENSE.md).
