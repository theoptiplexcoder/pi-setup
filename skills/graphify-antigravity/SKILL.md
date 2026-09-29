---
name: graphify-antigravity
description: Instructions and execution rules for running graphify in deep mode using the local antigravity-openai-bridge. Use only when invoking graphify in deep mode, running graphify extraction with antigravity, or executing graphify-deep without API keys.
---

# Graphify with Antigravity Bridge (Deep Mode)

This skill provides instructions and execution guidance for running `graphify` in deep extraction mode using the local `antigravity-openai-bridge`. It enables thorough semantic knowledge graph extraction and rich `INFERRED` edges using Google Antigravity OAuth tokens without requiring external API keys.

This skill should be invoked alongside the `graphify` skill whenever deep mode extraction is requested or needed.

---

## 1. Prerequisites & Architecture

1. **OAuth Credentials**: The bridge reads active Google Antigravity OAuth tokens from `~/.pi/agent/auth.json` (or dynamic client credentials from `pi-antigravity`). No third-party API key is needed.
2. **Local Bridge**: `~/.local/bin/antigravity-openai-bridge` acts as an OpenAI-compatible HTTP server running on port `51155` (translating `/v1/chat/completions` into Antigravity `generateContent` calls).
3. **Graphify Provider**: Configured in `~/.graphify/providers.json`:
   ```json
   {
     "antigravity": {
       "base_url": "http://127.0.0.1:51155/v1",
       "default_model": "gemini-3.8-flash",
       "env_key": "ANTIGRAVITY_DUMMY_KEY",
       "pricing": {
         "input": 0.0,
         "output": 0.0
       },
       "temperature": 0.0,
       "max_tokens": 8192,
       "vision": false
     }
   }
   ```

---

## 2. Automated Execution (Recommended)

When `npm run setup` is executed, the wrapper script `graphify-deep` is installed to `~/.local/bin/graphify-deep`. This wrapper handles health-checking port 51155, auto-starting the bridge daemon if offline, passing through arguments to `graphify extract`, and tearing down background processes if it spawned them.

### To run deep extraction on the current directory:
```bash
~/.local/bin/graphify-deep .
```

### To run on a specific target path:
```bash
~/.local/bin/graphify-deep /path/to/project
```

### Additional options:
```bash
# Force re-scan (skip incremental cache)
~/.local/bin/graphify-deep . --force

# Adjust parallel extraction workers
~/.local/bin/graphify-deep . --max-concurrency 4
```

---

## 3. Manual Execution / Direct CLI

If invoking directly via `graphify extract`:

### Step 1: Verify or start the bridge
```bash
# Check if port 51155 is already listening
lsof -i :51155 || ss -tulpn | grep 51155

# If not running, start in background
~/.local/bin/antigravity-openai-bridge &
```

### Step 2: Run extraction
```bash
ANTIGRAVITY_DUMMY_KEY="dummy" graphify extract . --backend antigravity --mode deep
```

---

## 4. LLM Operational Guidelines

When executing tasks or queries involving graphify deep mode:
1. **Never ask the user for an OpenAI/Anthropic/DeepSeek API key** when performing deep extraction in this harness; always use the `antigravity` provider.
2. Prefer `~/.local/bin/graphify-deep [path]` over manual bridge management to avoid dangling daemon processes or port conflicts.
3. Check `graphify-out/graph.json` after extraction to confirm nodes and edges were generated.
4. For follow-up queries, utilize standard `graphify query "<question>"`, `graphify path "NodeA" "NodeB"`, or `graphify explain "Node"`.
