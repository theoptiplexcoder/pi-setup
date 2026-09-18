# My Pi Harness

A portable, Git-managed Pi coding agent harness.

---

## 1. What is this repo about?

This repository provides a self-contained, reproducible development and execution harness for the [Pi coding agent](https://github.com/badlogic/pi) (`@earendil-works/pi-coding-agent`).

Instead of relying on unversioned global agent configurations or ad-hoc environment setups, this harness encapsulates all agent settings, subagent orchestrations, custom extensions, skills, and tools into a single Git-controlled repository. It allows you to:
- Maintain portable configurations that run consistently across machines.
- Isolate personal/machine-specific context (`AGENTS.local.md`) from shared team guidelines (`AGENTS.md`).
- Bundle specialized subagents, safety-first Git automation pipelines, dynamic context management, and knowledge graph tools out-of-the-box.

---

## 2. Features Included in this Custom Pi Config

- **Isolated & Version-Controlled Pi Configuration (`.pi/agent`):**
  - Settings, default models, thinking levels, and extension packages are tracked directly in the repo.
  - Portable wrappers in `bin/` (`bin/pi`, `bin/setup`, `bin/doctor`, `bin/update`) ensure Pi runs using repo-local settings (`PI_CODING_AGENT_DIR`).

- **Custom Local Extensions:**
  - **`git-watcher`**: Separates LLM code inspection and commit message generation from deterministic Git operations. Exposes `git_preflight_check` and `git_request_push` with safety gates (conflict marker detection, protected branch protection, auto-rebasing, and optional pre-push test checks).
  - **`agents-local`**: Injects machine-local, gitignored context (`AGENTS.local.md`) into agent sessions automatically without polluting shared repository instructions.

- **Pre-Configured Extension Packages:**
  - **`pi-antigravity`**: Authentication and model access via Google Antigravity OAuth (Gemini models, image generation).
  - **`opencode-pi`**: OpenCode provider integrations.
  - **`pi-web-access`**: Multi-provider search and real-time content fetching tools (`web_search`, `source_check`, `fetch_content`, `get_search_content`).
  - **`@davecodes/pi-dcp`**: Dynamic Context Pruning tools to compress long conversation history and keep sessions performant.
  - **`pi-subagents`**: Comprehensive subagent orchestration framework supporting isolated worktrees, parallel task fanout, chains, and supervisor review.
  - **`pi-memory`**: Persistent long-term, daily, and scratchpad memory search and retrieval.
  - **`@gaodes/pi-graphify`**: Codebase knowledge graph extraction, querying, visualization, and optional Antigravity OAuth bridge integration for deep extraction.

- **Bundled Agent Skills (`skills/`):**
  - `critic`: Verification-first validation running deterministic checks before completing tasks.
  - `memory`: Storing and recalling durable learnings, failure patterns, and corrections.
  - `planning`: Complex task planning structured as DAGs / mind-maps with human verification gates.
  - `skill-finder` & `skill-writer`: Discovering, writing, and evaluating custom skills according to the Agent Skills standard.

- **Specialized Subagents (`agents/`):**
  - `reviewer`: Dedicated reviewer subagent for assessing diffs, fixing issues, and orchestrating commits.

---

## 3. How to Use It

### Prerequisites
- Node.js (v18+ recommended)
- Git

### Quick Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url> pi-setup
   cd pi-setup
   ```

2. **Run setup:**
   ```bash
   ./bin/setup
   ```
   *or*
   ```bash
   npm run setup
   ```
   The setup script will:
   - Verify Node.js and ensure `pi` is installed globally.
   - Symlink skills, agents, prompts, and local extensions into `.pi/agent/`.
   - Install all required dependencies and extensions.
   - Prompt to optionally configure the Antigravity OAuth bridge for deep graph extraction.

3. **Configure Local Instructions (Optional):**
   Copy the example configuration to add machine-specific or personal instructions:
   ```bash
   cp AGENTS.local.md.example AGENTS.local.md
   ```

4. **Launch Pi:**
   Use the repository launcher:
   ```bash
   ./bin/pi
   ```

> **NOTE:** Personal suggestion: using [Herdr](https://herdr.dev) allows Pi to work much better with this harness. You can install it with:
> ```bash
> curl -fsSL https://herdr.dev/install.sh | sh
> ```

### Utility Scripts

- `./bin/doctor`: Checks the environment and health of dependencies, configuration, and tools.
- `./bin/update`: Updates Pi and installed extensions.

---

## Inspirations & Acknowledgments

- [sanjanb/my-agent-harness](https://github.com/sanjanb/my-agent-harness): Key inspiration for the harness architecture, portable agent environment structuring, and local agent configuration workflows.
