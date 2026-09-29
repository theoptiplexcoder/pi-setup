import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		// Escape hatch
		if (process.env.WT_GUARD === "off") {
			return;
		}

		// Only guard subagent dispatches
		if (event.toolName !== "subagent" && event.toolName !== "delegate_subagent") {
			return;
		}

		const input = event.input as any;
		
		// Management actions pass through
		if (input.action && ["status", "steer", "stop"].includes(input.action)) {
			return;
		}

		// Check if it's a known read-only agent
		const readOnlyAgents = ["scout", "researcher", "reviewer", "oracle", "advisor"];
		const agentName = input.agent;
		if (agentName && readOnlyAgents.includes(agentName)) {
			return; // Allowed
		}

		// Anything else is considered a writer (e.g. worker, delegate)

		const hasWorkflow = !!input.workflowScript;
		
		if (hasWorkflow) {
			// Scripted workflows: add worktree: true if neither worktree nor isolation is set
			if (input.worktree === undefined && input.isolation === undefined) {
				input.worktree = true; // Mutating input
			} else if (input.worktree === false) {
				throw new Error(
					"Worktree Guard: 'worktree: false' is blocked for scripted workflows. Use 'worktree: true' or rely on the automatic injection."
				);
			}
			// Note: The guard cannot inspect inside workflowScriptPath for worktree: false
		} else {
			// Direct writer calls: cwd must be a worktree path.
			// Checking either the requested cwd or the parent's cwd
			const targetCwd = input.cwd || ctx.cwd;
			const isWorktree = targetCwd.includes(".worktrees") || targetCwd.includes("pi-worktree") || targetCwd.includes("pi-subagents");
			
			if (!isWorktree) {
				throw new Error(
					"Worktree Guard Blocked: Writer subagents must run inside an isolated worktree. " +
					"Run wt agent to create a feature branch, or use a scripted workflow with worktree: true."
				);
			}
		}
	});
}
