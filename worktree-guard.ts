// worktree-guard.ts: pi extension. Enforces the session/child worktree layout
// created by the `wt` script, on every `subagent` call.
//
// Rules
//  1. Read-only agents (scout, reviewer, ...) are always allowed.
//  2. Scripted workflows (workflowScript): the parent must be inside a session
//     worktree. `worktree: true` is forced on if neither `worktree` nor
//     `isolation` is set. A literal `worktree: false` in the script is blocked.
//  3. Direct writer calls: `cwd` must resolve to a child worktree created by
//     `wt agent` (branch session/<s>--<t>) whose session is the parent's branch.
//  4. Management actions (status, steer, stop, ...) pass through.
//
// Set WT_GUARD=off to disable. Assumes the layout: <repo>.wt/<name> for sessions
// and <repo>.wt/<s>--<t> for children, branches session/<s> and session/<s>--<t>.
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";

const GUARDED_TOOLS = new Set(["subagent", "delegate_subagent"]);
const READ_ONLY_AGENTS = new Set(["scout", "researcher", "reviewer", "oracle", "advisor"]);

type WtInfo = { top: string; mainRoot: string; branch: string };

function git(cwd: string, ...args: string[]): string | null {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function inspect(dir: string): WtInfo | null {
  const top = git(dir, "rev-parse", "--show-toplevel");
  const common = git(dir, "rev-parse", "--path-format=absolute", "--git-common-dir");
  const branch = git(dir, "rev-parse", "--abbrev-ref", "HEAD");
  if (!top || !common || !branch) return null;
  return { top: realpathSync(top), mainRoot: dirname(realpathSync(common)), branch };
}

const underWtDir = (w: WtInfo) => w.top.startsWith(`${w.mainRoot}.wt${sep}`);
const isChild = (w: WtInfo) => underWtDir(w) && /^session\/[^/]+--[^/]+$/.test(w.branch);
const isSession = (w: WtInfo) => underWtDir(w) && /^session\/[^/]+$/.test(w.branch) && !w.branch.includes("--");

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    if (process.env.WT_GUARD === "off") return;
    if (!GUARDED_TOOLS.has(event.toolName)) return;

    const input = event.input as Record<string, any>;
    if (input.action) return; // management / status / control actions

    const block = (reason: string) => ({ block: true, reason });
    const here = inspect(ctx.cwd);
    const scripted = Boolean(input.workflowScript || input.workflowScriptPath);

    if (scripted) {
      if (!here || !(isSession(here) || isChild(here))) {
        return block(
          "Subagent workflows must run from a session worktree (branch session/<name>). " +
            "Create one with `wt session <name>` and start pi there.",
        );
      }
      if (typeof input.workflowScript === "string" && /worktree\s*:\s*false/.test(input.workflowScript)) {
        return block("Writers must be isolated: remove `worktree: false` from the workflowScript.");
      }
      if (input.worktree === undefined && input.isolation === undefined) {
        input.worktree = true; // mutate: default every workflow child to isolated worktrees
      }
      return;
    }

    if (READ_ONLY_AGENTS.has(String(input.agent))) return;

    const target = inspect(resolve(ctx.cwd, input.cwd ?? "."));
    if (!target || !isChild(target)) {
      return block(
        "Writer subagents must run in their own worktree. Either run `wt agent <session> <task>` " +
          "and retry with cwd set to the absolute path it prints, or use a workflowScript with " +
          "`worktree: true`.",
      );
    }
    const parentSession = target.branch.split("--")[0];
    if (!here || here.branch !== parentSession) {
      return block(
        `This child belongs to ${parentSession}, but the parent session is on ` +
          `${here?.branch ?? "an unknown branch"}. Use a child of the current session.`,
      );
    }
  });
}
