---
name: browser-use-antigravity
description: Run and orchestrate browser-use agents using Google Antigravity OAuth tokens via a dedicated local OpenAI-compatible bridge. Enables full vision (screenshots) and text mode using only a dummy API key without third-party LLM costs, with telemetry and cloud sync disabled.
---

# Browser-Use with Antigravity Bridge

This skill provides complete orchestration guidance and execution tooling for running `browser-use` automation tasks powered entirely by Google Antigravity OAuth credentials (via `~/.pi/agent/auth.json`), with **zero external API keys required** and all background telemetry strictly disabled.

---

## 1. Architecture

1. **OAuth Authentication**: Uses existing Google Antigravity OAuth tokens stored in `~/.pi/agent/auth.json`. No external API keys needed.
2. **Dedicated Bridge Daemon**: `~/.local/bin/browser-use-antigravity-bridge` listens locally on port `51156`. It translates OpenAI `/v1/chat/completions` API calls into Google Antigravity `v1internal:generateContent` calls.
3. **Multimodal Support & Output Normalization**:
   - Automatically converts OpenAI vision payloads (`image_url` data URLs) to Gemini `inlineData` parts.
   - Automatically normalizes shorthand action primitives (such as `click: 210` -> `click: {index: 210}`) so Pydantic validation passes 100% of the time.
4. **Privacy / Outbound Blocking**: Completely silences all telemetry (PostHog), PyPI version checking, and cloud syncing.

---

## 2. Starting the Bridge

Before running `browser-use` scripts, check if the bridge daemon is active or start it in the background:

```bash
# Check if port 51156 is already active
ss -tulpn | grep 51156

# Start in background if not already running
~/.local/bin/browser-use-antigravity-bridge &
```

Verify health:
```bash
NO_PROXY=127.0.0.1 curl -s http://127.0.0.1:51156/health
```

---

## 3. Standard Implementation Template

Always set telemetry environment variables at the top of your script to prevent any outbound requests to PostHog, cloud sync, or version checks:

```python
import os

# Disable all internal outbound tracking and telemetry in browser-use
os.environ["ANONYMIZED_TELEMETRY"] = "false"
os.environ["BROWSER_USE_CLOUD_SYNC"] = "false"
os.environ["BROWSER_USE_DISABLE_VERSION_CHECK"] = "true"

import asyncio
from browser_use import Agent
from browser_use.llm import ChatOpenAI

llm = ChatOpenAI(
    model="gemini-3.8-flash",
    base_url="http://127.0.0.1:51156/v1",
    api_key="ANTIGRAVITY_DUMMY_KEY",
)

async def main():
    agent = Agent(
        task="Go to https://arpitbhayani.me/bookshelf/ and find the #1 post title and points",
        llm=llm,
        llm_timeout=180,
        use_thinking=False,
        use_vision=True,  # Full screenshot vision supported
    )
    result = await agent.run()
    print("Final result:", result.final_result())

if __name__ == "__main__":
    asyncio.run(main())
```
