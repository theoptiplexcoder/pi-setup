# My Pi Harness

A portable, Git-managed Pi coding agent harness.

## Getting Started

1. Clone this repository to your local machine.
2. Run setup:
   ```bash
   ./bin/setup
   ```
   or
   ```bash
   npm run setup
   ```
3. Use the local Pi launcher:
   ```bash
   ./bin/pi
   ```

## Repository Structure

- `bin/pi`: Repository-local launcher for Pi
- `bin/setup`: Installs/updates Node dependencies and Pi extensions
- `bin/doctor`: Checks environment health
- `bin/update`: Updates Pi and extensions
- `.pi/agent`: Source-controlled Pi configuration (settings.json, etc)
- `AGENTS.md`: Shared harness configuration for agents
- `AGENTS.local.md`: Machine-specific configurations (not tracked by Git)
